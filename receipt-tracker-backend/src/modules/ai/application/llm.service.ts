import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ParsedReceipt } from '../interfaces';

/**
 * LLM Service using OpenAI API
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  private readonly model = 'gpt-4o-mini';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';

    this.httpClient = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. LLM service will not work.');
    }
  }

  /**
   * Parse receipt text using OpenAI
   */
  async parseReceiptText(rawText: string): Promise<ParsedReceipt> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'LLM service is not configured. Please set OPENAI_API_KEY in environment variables.',
      );
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new InternalServerErrorException('Cannot parse empty text');
    }

    try {
      this.logger.log('Starting LLM receipt parsing...');

      const prompt = this.buildPrompt(rawText);

      const response = await this.httpClient.post(this.apiEndpoint, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at parsing receipt text and extracting structured data. Extract the ACTUAL business/store name (not slogans or taglines). Extract ALL items from the receipt, not just one. Categorize each item and group by category. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);

      // Log full LLM response for debugging
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log('🤖 LLM RESPONSE (Complete JSON from OpenAI):');
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(JSON.stringify(parsed, null, 2));
      this.logger.log('═══════════════════════════════════════════════════════════');
      this.logger.log(`📅 LLM - Extracted receiptDate: "${parsed.receiptDate}"`);

      // Validate and transform to ParsedReceipt
      const result = this.validateAndTransform(parsed);

      this.logger.log(`📅 FINAL - Normalized receiptDate: "${result.receiptDate}"`);

      this.logger.log(
        `LLM parsing successful. Store: ${result.store.name}, Categories: ${result.categoryReceipts.length}`,
      );

      return result;
    } catch (error) {
      this.logger.error('LLM parsing failed', error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new InternalServerErrorException(`OpenAI API error: ${message}`);
      }

      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException('Failed to parse LLM response as JSON');
      }

      throw new InternalServerErrorException('Failed to parse receipt text');
    }
  }

  /**
   * Build prompt for OpenAI
   */
  private buildPrompt(rawText: string): string {
    return `
You are an expert at parsing receipt text. Extract structured data accurately.

IMPORTANT EXAMPLES:

Example 1 - Store name from slogan recognition:
Receipt text: "How doers get more\n235 Rd Moncton\n..."
Correct store name: "THE HOME DEPOT" or "HOME DEPOT" (recognize "How doers get more" is Home Depot's slogan)
Wrong: "How doers get more" (this is a slogan, not the store name)
Wrong: "BOURQUE" (random word, not store name)

Example 2 - Extract ALL items and match correctly with product codes:
Receipt text: "067001000904 TEFI-OW4PE\n820909131021 Adj wrench\nSUBTOTAL\n13.93\nTOTAL $17.20"
Analysis: Two items visible - need to match names with prices correctly
Correct items: [{"name": "TEFI-OW4PE", "total": 0.98}, {"name": "Adj wrench", "total": 13.98}]
WRONG: [{"name": "Adj wrench", "total": 0.93}] - This mixes item name with wrong price!

Example 3 - Item matching rules:
- Product codes (like "820909131021") should be removed from item names, keep only product description
- Match each item line with its corresponding price
- Look for patterns: "CODE PRODUCT_NAME" followed by price
- If prices are listed separately, carefully match them to the correct items

Example 4 - Insurance/Patient payment amounts:
Receipt text: "Total: 19.23\nInsurance Paid: $9.23\nPatient Pays: $10.00"
Correct total: 10.00 (use "Patient Pays" amount, not "Total" which includes insurance)
Wrong: 19.23 (this includes insurance payment, not what the user actually paid)
- If you see "Patient Pays", "Amount Paid", "You Paid", "Customer Pays", "Out of Pocket", "Deductible", use THAT amount as the total
- The "Total" field that includes insurance should NOT be used if "Patient Pays" is available
- This applies to prescription receipts, medical bills, and any receipts with insurance coverage

Example 5 - Store name recognition:
Receipt text: "COSTCO WHOLESALE\nLocation #1345\nSELF-CHECKOUT\n140 Granite Drive..."
Correct store name: "COSTCO" or "COSTCO WHOLESALE"
Wrong: "SELF-CHECKOUT" (this is a transaction type, not store name)
- Recognize "Costco Wholesale" → "COSTCO" or "COSTCO WHOLESALE"
- Look for prominent store names even if followed by "Wholesale", "Inc", "Ltd", etc.
- "SELF-CHECKOUT", "CUSTOMER COPY", "TRANSACTION" are NOT store names - ignore them
- Store name is usually the first prominent business name at the top

Example 6 - Date extraction (CRITICAL):
Receipt text: "COSTCO WHOLESALE\n2025/11/21 12:52:58\nInvoice #202404\n..."
Correct date: "2025-11-21" (extract from "2025/11/21" in the receipt)
Wrong: "2023-10-10" (this is NOT in the receipt, do NOT use old dates or today's date)
Wrong: Using today's date when receipt clearly shows "2025/11/21"
- If receipt shows "2025/11/21 12:52:58", extract "2025-11-21" (ignore time)
- If receipt shows "Date: 2025/11/21", extract "2025-11-21"
- If receipt shows "Jun 10, 2025" or "June 10, 2025", extract "2025-06-10"
- If receipt shows "11/21/2025", extract "2025-11-21"

Example 6b - Incomplete date (OCR error) - CRITICAL:
Receipt text: "COSTCO WHOLESALE\n140 Granite Drive\n...items...\n6/11/2\nInvoice Number: 202404\n..."
Analysis: "6/11/2" is an INCOMPLETE date (truncated year). Search the ENTIRE receipt for a complete date.
Common locations for complete dates:
- Near the top with store name and time: "2025/11/21 12:52:58"
- With "Date:" label
- In transaction details
Correct approach: Search entire text for "YYYY/MM/DD" or "YYYY-MM-DD" patterns. If found, use that.
Wrong: "2026-06-11" (DO NOT guess/complete incomplete dates like "6/11/2")
Wrong: Using "6/11/2" and guessing it's "June 11, 2026"
- If you ONLY see incomplete dates like "6/11/2", set needsReview to true and use current date
- NEVER guess the year from partial date strings
- ALWAYS extract the date that appears in the receipt text, even if it seems like a future date
- DO NOT use today's date or any date that is not explicitly shown in the receipt
- The date is usually near the top of the receipt, often with timestamp
- Look for patterns like "YYYY/MM/DD", "MM/DD/YYYY", "Month DD, YYYY", etc.

Example 6c - YY/MM/DD format (2-digit year FIRST) - CRITICAL:
Receipt text: "Store ABC\n123 Main St\n...items...\nDate: 26/01/08\nTotal: $50.00"
Analysis: Date shows "26/01/08" - this is YY/MM/DD format
- First number is 26 (which is > 12, so it CANNOT be a month or day in standard format)
- When first number > 12, this indicates YY/MM/DD format (year comes first)
- 26 = YEAR → 2026 (years 00-40 become 2000-2040)
- 01 = MONTH → January
- 08 = DAY → 8th
Correct date: "2026-01-08" (January 8, 2026)
Wrong: "2008-01-26" (this incorrectly treats 26 as day)
Wrong: "2008-06-01" (completely wrong)

Another example with YY/MM/DD:
Receipt shows "26/06/08":
- 26 = YEAR (2026)
- 06 = MONTH (June)
- 08 = DAY (8th)
Correct: "2026-06-08" (June 8, 2026)

RULE: In format XX/XX/XX, if FIRST number > 12, interpret as YY/MM/DD (year/month/day)

---

Now parse the following receipt text:

Receipt Text:
"""
${rawText}
"""

Please extract and return the following information in JSON format:

{
  "store": {
    "name": "Store name (REQUIRED - only store name, no address needed)",
    "phone": "Store phone if available"
  },
  "receiptDate": "Receipt date in ISO format (YYYY-MM-DD)",
  "paymentMethod": "Payment method - one of: CARD, CASH, OTHER (only the method type, not card details)",
  "totals": {
    "subtotal": "Overall subtotal amount (number)",
    "tax": "Overall tax amount (number)",
    "total": "Overall total amount (number, required)"
  },
  "categoryReceipts": [
    {
      "category": "Category name - one of: GROCERY, HEALTH, EDUCATION, ENTERTAINMENT, TRANSPORTATION, UTILITIES, RESTAURANT, SHOPPING, OTHER",
      "total": "Total amount for this category including tax if applicable (number, required)",
      "subtotal": "Subtotal for this category before tax (number, optional)",
      "tax": "Tax amount for this category (number, optional - only if tax can be distributed to this category)"
    }
  ],
  "needsReview": "true if confidence is low or data is unclear, false otherwise"
}

CRITICAL RULES:
- DO NOT return individual items in the response. Analyze items internally to determine categories, but only return category summaries.
- The categoryReceipts array should contain one object per category found in the receipt.
- If all items belong to a single category, return an array with one object.
- If items belong to multiple categories, return multiple objects - one for each category.
- For each category, sum up all items in that category to get the subtotal.
- Tax distribution:
  * If tax can be clearly attributed to specific categories (e.g., different tax rates per category), distribute tax accordingly
  * If tax cannot be distributed, add ALL tax to ONE category (preferably the category with the largest subtotal)
  * The sum of all categoryReceipts totals MUST equal the overall totals.total
- Each categoryReceipt.total should be: subtotal + tax (if tax is included for that category)

CRITICAL RULES:

1. STORE NAME (CRITICAL):
   - Extract the ACTUAL BUSINESS NAME, not slogans, taglines, marketing phrases, or random words
   - IMPORTANT: Recognize common store names and variations:
     * "How doers get more" or "How doers get more done" → "THE HOME DEPOT" or "HOME DEPOT"
     * "Save money. Live better." → "WALMART"
     * "Expect more. Pay less." → "TARGET"
     * "Costco Wholesale" or "COSTCO WHOLESALE" → "COSTCO" or "COSTCO WHOLESALE"
     * "Shoppers Drug Mart" → "SHOPPERS DRUG MART"
   - Store name is usually at the TOP of the receipt, often in larger/bold text
   - DO NOT use phrases like "How doers get more", "Save money", "Everyday low prices" as store name
   - DO NOT use "SELF-CHECKOUT", "CUSTOMER COPY", or transaction types as store name
   - DO NOT use single words or partial names unless it's clearly the business name
   - Look for the actual company/business name (e.g., "Home Depot", "Walmart", "Target", "Canadian Tire", "Costco", "Shoppers Drug Mart")
   - If you see a slogan but not the store name explicitly, use your knowledge to identify the store
   - Common patterns: Look for the first prominent text at the top, usually before address or phone
   - If you see multiple potential names, choose the one that appears most prominently or is most likely to be a business name
   - If uncertain, look for text that appears before address/phone information
   - Store name is REQUIRED - if truly uncertain, set needsReview to true

2. ITEM ANALYSIS (FOR CATEGORIZATION ONLY - DO NOT RETURN ITEMS):
   - Extract and analyze ALL items from the receipt internally
   - Look for itemized lists with product names and prices
   - Match each item name with its correct price
   - Use items ONLY to determine categories - DO NOT return items in the JSON response
   - Read each line carefully: item name and its corresponding price should be on the same line or clearly associated
   - PRODUCT CODES: If you see patterns like "820909131021 Adj wrench", extract only "Adj wrench" as the name (remove the product code)
   - PRICE MATCHING: Carefully match each item with its price. Prices may appear:
     * On the same line as the item
     * On a separate line below the item
     * In a price column
   - Look for patterns: Item lines usually appear before "SUBTOTAL" or "TOTAL" sections
   - Be very careful to match the correct price with the correct item name

3. ITEM CATEGORIZATION (CRITICAL):
   - Analyze EACH item individually and determine which category it belongs to
   - Categories: GROCERY (food, supermarket items), HEALTH (pharmacy, medicine, health products), EDUCATION (school supplies, books, educational materials), ENTERTAINMENT (movies, games, tickets), TRANSPORTATION (gas, public transport, parking), UTILITIES (electricity, water, phone bills), RESTAURANT (dining out, food delivery), SHOPPING (general retail, clothing, electronics), OTHER
   - Group items by category internally
   - Calculate totals separately for each category:
     * For each category, sum up all item prices in that category to get the category's subtotal
     * The "subtotal" field in each categoryReceipt should be the sum of all items in that category (before tax)
   - Examples:
     * "Milk", "Bread", "Eggs" → GROCERY
     * "Aspirin", "Bandages", "Vitamins" → HEALTH
     * "Notebook", "Pens", "Textbook" → EDUCATION
     * "Movie ticket", "Popcorn" → ENTERTAINMENT
     * "Gas", "Parking fee" → TRANSPORTATION
     * "Electricity bill" → UTILITIES
     * "Pizza", "Burger", "Coffee" → RESTAURANT
     * "T-shirt", "Laptop", "Headphones" → SHOPPING
   - If a receipt has items from multiple categories (e.g., Grocery items + Health items), create separate categoryReceipt objects for each
   - If all items belong to one category, create a single categoryReceipt object
   - IMPORTANT: The overall "totals" field should contain the grand total of the entire receipt, while each categoryReceipt.total should contain only the sum for that specific category (including tax if applicable)

4. PAYMENT METHOD (REQUIRED):
   - Determine how payment was made: CARD, CASH, or OTHER
   - Look for keywords:
     * "CASH", "Cash", "Paid Cash" → CASH
     * "CARD", "Card", "Credit", "Debit", "Visa", "Mastercard", "AMEX" → CARD
     * If you see card information (card type, last 4 digits) → CARD
   - IMPORTANT: Only return the payment method type (CARD, CASH, or OTHER)
   - DO NOT extract or return card details (card type, card number, last 4 digits) - we only need to know if it was paid with card or cash

5. TOTALS AND TAX DISTRIBUTION (CRITICAL):
   - Overall total amount is REQUIRED - BUT use the amount the USER ACTUALLY PAID, not the total that includes insurance
   - IMPORTANT: If receipt shows insurance/coverage payments:
     * Look for fields like "Patient Pays", "Amount Paid", "You Paid", "Customer Pays", "Out of Pocket", "Deductible"
     * Use THAT amount as the total, NOT the "Total" field that includes insurance
     * Example: If "Total: $19.23" and "Patient Pays: $10.00", use $10.00 as the total
     * This is critical for prescription receipts, medical bills, and insurance-covered purchases
   - Extract overall subtotal if shown separately (use subtotal BEFORE insurance, if applicable)
   - Extract overall tax if shown separately
   - All prices should be numbers without currency symbols
   - Tax distribution rules:
     * If tax can be clearly attributed to specific categories (e.g., different tax rates, tax shown per category), distribute tax proportionally or as indicated
     * If tax cannot be distributed (single tax amount for entire receipt), add ALL tax to ONE category only
     * Prefer adding tax to the category with the largest subtotal
     * The sum of all categoryReceipts totals MUST equal the overall totals.total
     * Example: If total is $100 with $10 tax, and Category A subtotal is $60, Category B subtotal is $30:
       - Option 1: Add all $10 tax to Category A → Category A total = $70, Category B total = $30, Sum = $100 ✓
       - Option 2: Distribute tax proportionally → Category A tax = $6.67, Category B tax = $3.33 → Category A total = $66.67, Category B total = $33.33, Sum = $100 ✓
   - For each categoryReceipt:
     * subtotal = sum of all items in that category (before tax)
     * tax = tax amount for this category (if tax is distributed, otherwise 0 or undefined)
     * total = subtotal + tax (if tax is included for this category)

6. RECEIPT DATE (CRITICAL - READ CAREFULLY):
   - Receipt date is REQUIRED - extract the ACTUAL date from the receipt text, NOT today's date
   - IMPORTANT: Look for the date in the receipt text itself, usually near the top or with timestamp
  - Common date formats in receipts (extract EXACTLY as shown):
    * YYYY/MM/DD (e.g., "2025/11/21" → return "2025-11-21")
    * YYYY/MM/DD with time (e.g., "2025/11/21 12:52:58" → extract "2025-11-21", ignore time)
    * YYYY-MM-DD (e.g., "2025-11-21" → return "2025-11-21")
    * Month DD, YYYY (e.g., "November 21, 2025" → return "2025-11-21")
    * Mon DD, YYYY (e.g., "Nov 21, 2025" → return "2025-11-21")
    * MM/DD/YYYY (e.g., "11/21/2025" → return "2025-11-21")
    * DD/MM/YYYY (e.g., "21/11/2025" → return "2025-11-21")
  
  - CRITICAL: 2-digit year formats - READ CAREFULLY:
    
    **Format 1: YY/MM/DD (Year first, then month, then day)**
    When the FIRST number is LARGER than 12, it represents the YEAR:
    * "26/01/08" → YEAR=26 (2026), MONTH=01 (January), DAY=08 → return "2026-01-08"
    * "26/06/08" → YEAR=26 (2026), MONTH=06 (June), DAY=08 → return "2026-06-08"
    * "24/12/25" → YEAR=24 (2024), MONTH=12 (December), DAY=25 → return "2024-12-25"
    * Logic: If first number > 12, it CANNOT be a month (months are 01-12), so it must be the year
    * Years 00-40 → 2000-2040, years 41-99 → 1941-1999
    
    **Format 2: DD/MM/YY (Day first, month middle, year last)**
    When the LAST number is the year:
    * "08/01/26" → DAY=08, MONTH=01 (January), YEAR=26 (2026) → return "2026-01-08"
    * "25/12/24" → DAY=25, MONTH=12 (December), YEAR=24 (2024) → return "2024-12-25"
    
    **Format 3: MM/DD/YY (Month first, day middle, year last)**
    When second number > 12:
    * "01/26/08" → MONTH=01 (January), DAY=26, YEAR=08 (2008) → return "2008-01-26"
  
  - IMPORTANT RULE: When you see a 2-digit format like "26/01/08":
    * Look at the FIRST number
    * If first number > 12 (like 26), it is the YEAR, not the day
    * Format is YY/MM/DD: YEAR/MONTH/DAY
    * Example: "26/01/08" = Year 2026, Month 01 (January), Day 08 = "2026-01-08"
   - Examples:
     * Receipt shows "2025/11/21 12:52:58" → return "2025-11-21"
     * Receipt shows "Date: 2025/11/21" → return "2025-11-21"
     * Receipt shows "11/21/2025" → return "2025-11-21"
     * Receipt shows "November 21, 2025" → return "2025-11-21"
   - CRITICAL RULES FOR INCOMPLETE OR AMBIGUOUS DATES:
     * If you see an incomplete date (e.g., "6/11/2" without a complete year), search the ENTIRE receipt text for the complete date
     * Look for full dates near: invoice numbers, timestamps, "Date:", transaction details, or at the top of the receipt
     * For ambiguous formats like "M/D/Y" or "MM/DD/YY", carefully look at the context:
       - Check if there's a full year (YYYY) elsewhere in the receipt
       - Consider if the year makes sense (receipts are usually recent, not from the future)
       - If you see "2025/11/21" anywhere in the receipt, that's the correct date, NOT "6/11/2" or incomplete variants
     * IMPORTANT: When you see both complete and incomplete dates, ALWAYS use the COMPLETE date
       - Example: If receipt has both "6/11/2" and "2025/11/21 12:52:58", use "2025-11-21"
     * DO NOT guess or infer incomplete dates - search for the full date in the text
     * DO NOT prefer future dates over past dates unless the full date is clearly stated
     * If receipt shows "2025/11/21", return "2025-11-21" - do NOT use today's date
     * If receipt shows "Jun 10, 2025", return "2025-06-10" - do NOT use any other date
     * Only use today's date as a last resort if NO date is found anywhere in the receipt text
   - Return date in ISO format: YYYY-MM-DD (e.g., "2025-11-21")

7. OTHER:
   - Store address is NOT needed - only store name is required
   - Currency is NOT needed - omit currency field
   - If subtotal or tax is not found, omit those fields (set to null)
   - Set needsReview to true if you're uncertain about any data, especially store name, category, payment method, or missing items
   - Return ONLY valid JSON, no extra text
   - Be thorough - extract ALL items, not just the first one you see

Return the JSON object:`;
  }

  /**
   * Validate and transform LLM response
   */
  private validateAndTransform(parsed: any): ParsedReceipt {
    // Validate required fields
    if (!parsed.store || !parsed.store.name) {
      throw new Error('Store name is required');
    }

    if (!parsed.totals || typeof parsed.totals.total !== 'number') {
      throw new Error('Total amount is required');
    }

    if (!parsed.receiptDate) {
      throw new Error('Receipt date is required');
    }

    if (
      !parsed.categoryReceipts ||
      !Array.isArray(parsed.categoryReceipts) ||
      parsed.categoryReceipts.length === 0
    ) {
      throw new Error('At least one category receipt is required');
    }

    // Validate each category receipt
    for (const catReceipt of parsed.categoryReceipts) {
      if (!catReceipt.category) {
        throw new Error('Category is required for each category receipt');
      }
      if (typeof catReceipt.total !== 'number') {
        throw new Error('Total amount is required for each category receipt');
      }
    }

    // Validate that sum of category totals equals overall total
    const sumOfCategoryTotals = parsed.categoryReceipts.reduce(
      (sum, cr) => sum + (cr.total || 0),
      0,
    );
    const overallTotal = parsed.totals?.total || 0;
    if (Math.abs(sumOfCategoryTotals - overallTotal) > 0.01) {
      // Allow small rounding differences (1 cent)
      throw new Error(
        `Sum of category totals (${sumOfCategoryTotals}) does not match overall total (${overallTotal})`,
      );
    }

    // Transform to ParsedReceipt
    const result: ParsedReceipt = {
      store: {
        name: parsed.store.name.trim(),
        phone: parsed.store.phone?.trim() || undefined,
      },
      receiptDate: (() => {
        const normalizedDate = this.normalizeDate(parsed.receiptDate);
        this.logger.log(
          `Date extraction - Original: "${parsed.receiptDate}", Normalized: "${normalizedDate}"`,
        );
        return normalizedDate;
      })(),
      paymentMethod: parsed.paymentMethod?.trim()?.toUpperCase() || undefined,
      totals: {
        subtotal: typeof parsed.totals.subtotal === 'number' ? parsed.totals.subtotal : undefined,
        tax: typeof parsed.totals.tax === 'number' ? parsed.totals.tax : undefined,
        total: parsed.totals.total,
      },
      categoryReceipts: parsed.categoryReceipts.map((catReceipt: any) => ({
        category: catReceipt.category.trim().toUpperCase(),
        total: catReceipt.total,
        subtotal: typeof catReceipt.subtotal === 'number' ? catReceipt.subtotal : undefined,
        tax: typeof catReceipt.tax === 'number' ? catReceipt.tax : undefined,
      })),
      needsReview: parsed.needsReview === true,
    };

    return result;
  }

  /**
   * Normalize date to ISO format (YYYY-MM-DD)
   * Handles various date formats from receipts
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr || typeof dateStr !== 'string') {
      this.logger.warn("Invalid date string provided, using today's date");
      return new Date().toISOString().split('T')[0];
    }

    try {
      // If already in ISO format (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
        return dateStr.trim();
      }

      // Handle YYYY/MM/DD format (common in receipts like 2025/11/21)
      const yyyyMMddMatch = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
      if (yyyyMMddMatch) {
        const [, year, month, day] = yyyyMMddMatch;
        return `${year}-${month}-${day}`;
      }

      // Handle 2-digit year formats: YY/MM/DD, DD/MM/YY, or MM/DD/YY
      // Example: 26/01/08, 08/01/26
      const twoDigitMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
      if (twoDigitMatch) {
        const [, first, second, third] = twoDigitMatch;
        const firstNum = parseInt(first, 10);
        const secondNum = parseInt(second, 10);
        const thirdNum = parseInt(third, 10);

        // Determine format by checking which interpretation makes sense
        // Priority: Check if it's YY/MM/DD first (if third number could be a valid day)

        // Check if YY/MM/DD format (year first)
        // Second must be valid month (1-12), third must be valid day (1-31)
        if (secondNum >= 1 && secondNum <= 12 && thirdNum >= 1 && thirdNum <= 31 && firstNum > 12) {
          // Likely YY/MM/DD because first > 12 (can't be month or day)
          const fullYear = firstNum <= 40 ? 2000 + firstNum : 1900 + firstNum;
          this.logger.log(
            `Parsed YY/MM/DD: ${first}/${second}/${third} → ${fullYear}-${second}-${third}`,
          );
          return `${fullYear}-${second.padStart(2, '0')}-${third.padStart(2, '0')}`;
        }

        // Check if DD/MM/YY format (year last, day first)
        if (firstNum > 12 && secondNum >= 1 && secondNum <= 12) {
          // DD/MM/YY format (e.g., 26/01/08 → 2008-01-26)
          const fullYear = thirdNum <= 40 ? 2000 + thirdNum : 1900 + thirdNum;
          this.logger.log(
            `Parsed DD/MM/YY: ${first}/${second}/${third} → ${fullYear}-${second}-${first}`,
          );
          return `${fullYear}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
        }

        // Check if MM/DD/YY format (year last, month first)
        if (secondNum > 12 && firstNum >= 1 && firstNum <= 12) {
          // MM/DD/YY format (e.g., 01/26/08 → 2008-01-26)
          const fullYear = thirdNum <= 40 ? 2000 + thirdNum : 1900 + thirdNum;
          this.logger.log(
            `Parsed MM/DD/YY: ${first}/${second}/${third} → ${fullYear}-${first}-${second}`,
          );
          return `${fullYear}-${first.padStart(2, '0')}-${second.padStart(2, '0')}`;
        }

        // Ambiguous case - all numbers <= 12
        // Default to DD/MM/YY (European format, more common globally)
        const fullYear = thirdNum <= 40 ? 2000 + thirdNum : 1900 + thirdNum;
        this.logger.log(
          `Ambiguous date ${first}/${second}/${third}, assuming DD/MM/YY → ${fullYear}-${second}-${first}`,
        );
        return `${fullYear}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
      }

      // Handle MM/DD/YYYY format
      const mmddyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (mmddyyyyMatch) {
        const [, month, day, year] = mmddyyyyMatch;
        return `${year}-${month}-${day}`;
      }

      // Handle DD/MM/YYYY format
      const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (ddmmyyyyMatch) {
        // Try to determine if it's DD/MM or MM/DD by checking if day > 12
        const [, first, second, year] = ddmmyyyyMatch;
        const firstNum = parseInt(first, 10);
        const secondNum = parseInt(second, 10);

        // If first number > 12, it's likely DD/MM/YYYY
        if (firstNum > 12) {
          return `${year}-${second}-${first}`;
        }
        // Otherwise assume MM/DD/YYYY
        return `${year}-${first}-${second}`;
      }

      // Handle "Month DD, YYYY" or "Mon DD, YYYY" format (e.g., "Jun 10, 2025" or "June 10, 2025")
      const monthNameMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
      if (monthNameMatch) {
        const [, monthName, day, year] = monthNameMatch;
        const monthNames = [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ];
        const monthNameLower = monthName.toLowerCase();
        const monthIndex = monthNames.findIndex(m => m.startsWith(monthNameLower));

        if (monthIndex !== -1) {
          const month = String(monthIndex + 1).padStart(2, '0');
          const dayPadded = String(parseInt(day, 10)).padStart(2, '0');
          return `${year}-${month}-${dayPadded}`;
        }
      }

      // Try standard Date parsing (handles most formats)
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // Return in YYYY-MM-DD format (not full ISO with time)
        return date.toISOString().split('T')[0];
      }

      this.logger.warn(`Could not parse date: ${dateStr}, using today's date`);
      return new Date().toISOString().split('T')[0];
    } catch (error) {
      this.logger.error(`Error normalizing date: ${dateStr}`, error);
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Check if LLM service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
