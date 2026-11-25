--
-- PostgreSQL database dump
--

\restrict NGfXpmP4AaGpJKePCcjX8W2khaYbAGVsDrUNrFeD0Y5thcUTDlbAWQKffXvMzV6

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: payment_method_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method_enum AS ENUM (
    'CARD',
    'CASH',
    'OTHER'
);


--
-- Name: receipt_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.receipt_status_enum AS ENUM (
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'NEEDS_REVIEW'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    receipt_date date NOT NULL,
    subtotal numeric(10,2),
    tax numeric(10,2),
    total numeric(10,2) NOT NULL,
    status public.receipt_status_enum DEFAULT 'PROCESSING'::public.receipt_status_enum NOT NULL,
    needs_review boolean DEFAULT false NOT NULL,
    raw_ocr_text text,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    payment_method public.payment_method_enum,
    user_id uuid NOT NULL,
    category character varying(100),
    store_name character varying(255) NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    google_id character varying(255),
    avatar_url character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1700000000000	InitialSchema1700000000000
2	1733932800000	AddReceiptCategoryAndPaymentMethod1733932800000
3	1734000000000	RemoveCurrencyColumn1734000000000
4	1735000000000	CreateUserAndRefreshToken1735000000000
5	1736000000000	AddUserIdToReceiptsAndRemoveCardFields1736000000000
6	1737000000000	ConvertCategoryToVarchar1737000000000
7	1738000000000	SimplifyReceiptStructure1738000000000
8	1739000000000	RemoveStoresAndCategoriesTables1739000000000
9	1740000000000	CreateContactMessagesTable1740000000000
10	1741000000000	RemoveContactMessagesTable1741000000000
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receipts (id, receipt_date, subtotal, tax, total, status, needs_review, raw_ocr_text, image_url, created_at, updated_at, payment_method, user_id, category, store_name) FROM stdin;
f62fcf09-6cd9-4c84-a6c9-c22a878d207c	2026-01-23	190.44	3.60	194.04	COMPLETED	f	\N	\N	2026-01-23 23:19:20.488788	2026-01-23 23:19:20.488788	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	GROCERY	COSTCO
6d1685e3-7ddf-4841-888f-22da3bcaf545	2026-01-23	34.38	\N	34.38	COMPLETED	f	\N	\N	2026-01-23 23:50:25.746804	2026-01-23 23:50:25.746804	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	GROCERY	WALMART
3fa0dbe2-9e73-4a08-8d9e-66e2d6584327	2026-01-23	\N	\N	60.00	COMPLETED	f	\N	\N	2026-01-23 23:56:54.796721	2026-01-23 23:57:11.440698	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	UTILITIES	Castco- Gas
45c95607-9d9d-4ae3-b3a7-d68b6803132b	2026-01-23	4.99	\N	4.99	COMPLETED	f	\N	\N	2026-01-24 00:02:42.727109	2026-01-24 08:52:29.620873	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	GROCERY	TRINITY SUPERSTORE
348a5e42-0840-4f69-936d-3b1c79a47753	2026-01-23	4.50	\N	4.50	COMPLETED	f	\N	\N	2026-01-24 00:01:42.95674	2026-01-24 08:52:58.495272	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	GROCERY	REAL ATLANTIC SUPERSTORE
728de7c1-3441-4325-a4d0-6283f68b194c	2025-11-21	180.26	\N	180.26	COMPLETED	f	\N	\N	2026-03-24 16:44:13.094387	2026-03-24 16:44:13.094387	CARD	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	GROCERY	COSTCO
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
33029173-0d7e-4308-b36e-1b2babf905ca	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzE3M2IyMC1lY2NlLTRjNWUtYWExMi1hN2UzNzEwY2JmNDgiLCJlbWFpbCI6ImFsaWJyYXZlODg2N0BnbWFpbC5jb20iLCJpYXQiOjE3NjkxMTQ1MTksImV4cCI6MTc2OTcxOTMxOX0.0_0JaR4HxmuNxx3vr1Gssien4K6r8IbVEBQ6pKxxdds	2026-01-29 20:41:59.775	2026-01-22 20:41:59.781214
0ea534b6-edd0-443c-a532-4217bb9442a2	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzE3M2IyMC1lY2NlLTRjNWUtYWExMi1hN2UzNzEwY2JmNDgiLCJlbWFpbCI6ImFsaWJyYXZlODg2N0BnbWFpbC5jb20iLCJpYXQiOjE3NjkyMTAzMDIsImV4cCI6MTc2OTgxNTEwMn0.nnv4Oha-VsfBTYsP1gtNV_cIo_bUw9o0pXszZ8F4-No	2026-01-30 23:18:22.831	2026-01-23 23:18:22.837998
0b064bb8-42b9-466f-b9f4-93798f8627c5	e3173b20-ecce-4c5e-aa12-a7e3710cbf48	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMzE3M2IyMC1lY2NlLTRjNWUtYWExMi1hN2UzNzEwY2JmNDgiLCJlbWFpbCI6ImFsaWJyYXZlODg2N0BnbWFpbC5jb20iLCJpYXQiOjE3Njk3Njc2NTgsImV4cCI6MTc3MDM3MjQ1OH0.pEBC-BCaH9OwQ4Wo4qi4YBp5uxEPrtM8kDtqGzxo42g	2026-02-06 10:07:38.023	2026-01-30 10:07:38.024376
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, google_id, avatar_url, created_at, updated_at) FROM stdin;
e3173b20-ecce-4c5e-aa12-a7e3710cbf48	alibrave8867@gmail.com	Ali Shoja	117431325651689625793	https://lh3.googleusercontent.com/a/ACg8ocKFztKB3g3u9rPh_cJPS7JDb7y7Xb91lBrC8Rt9aU0oOHaigMGi=s96-c	2026-01-22 15:12:06.577823	2026-01-22 15:12:06.577823
5fb5f89a-c7bd-4e37-939a-13f3d0d37a73	alishojaa88@gmail.com	Ali Shoja	105268225334801081900	https://lh3.googleusercontent.com/a/ACg8ocKEKsPGV_Zu6x2nwOstNrQXwO4r6Gw0QXoS4FQH9GluC0mI8vs=s96-c	2026-03-24 14:53:43.443789	2026-03-24 14:53:43.443789
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 10, true);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: receipts PK_receipts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT "PK_receipts" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_refresh_tokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_refresh_tokens" PRIMARY KEY (id);


--
-- Name: users PK_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users" PRIMARY KEY (id);


--
-- Name: refresh_tokens UQ_refresh_tokens_token; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "UQ_refresh_tokens_token" UNIQUE (token);


--
-- Name: users UQ_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_email" UNIQUE (email);


--
-- Name: users UQ_users_google_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_google_id" UNIQUE (google_id);


--
-- Name: IDX_receipts_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_receipts_date" ON public.receipts USING btree (receipt_date);


--
-- Name: IDX_receipts_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_receipts_payment_method" ON public.receipts USING btree (payment_method);


--
-- Name: IDX_receipts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_receipts_status" ON public.receipts USING btree (status);


--
-- Name: IDX_receipts_store_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_receipts_store_name" ON public.receipts USING btree (store_name);


--
-- Name: IDX_receipts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_receipts_user_id" ON public.receipts USING btree (user_id);


--
-- Name: IDX_refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refresh_tokens_token" ON public.refresh_tokens USING btree (token);


--
-- Name: IDX_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refresh_tokens_user_id" ON public.refresh_tokens USING btree (user_id);


--
-- Name: receipts FK_receipts_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT "FK_receipts_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens FK_refresh_tokens_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "FK_refresh_tokens_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict NGfXpmP4AaGpJKePCcjX8W2khaYbAGVsDrUNrFeD0Y5thcUTDlbAWQKffXvMzV6

