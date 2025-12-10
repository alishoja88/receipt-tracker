import { Button } from '@/components/ui/button';

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">📄 Receipt Tracker</h1>
          <p className="text-muted-foreground text-lg">Welcome to Receipt Tracker Application</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium">Frontend is running successfully!</p>
          </div>
          <p className="text-sm text-muted-foreground">shadcn/ui components are ready to use</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Frontend</h3>
            <p className="text-sm text-muted-foreground">http://localhost:5173</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Backend API</h3>
            <p className="text-sm text-muted-foreground">http://localhost:3000/api</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
