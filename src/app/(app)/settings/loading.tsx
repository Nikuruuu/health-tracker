export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-muted/80 rounded" />
        <div className="h-8 w-72 bg-muted rounded-md" />
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted/60 rounded" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="h-36 rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted/60 rounded" />
                <div className="h-4 w-32 bg-muted/40 rounded mt-6" />
              </div>
              <div className="h-36 rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted/60 rounded" />
                <div className="h-4 w-32 bg-muted/40 rounded mt-6" />
              </div>
              <div className="h-36 rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted/60 rounded" />
                <div className="h-4 w-32 bg-muted/40 rounded mt-6" />
              </div>
              <div className="h-36 rounded-xl bg-card border border-border p-5 space-y-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted/60 rounded" />
                <div className="h-4 w-32 bg-muted/40 rounded mt-6" />
              </div>
            </div>

            <div className="h-10 rounded-lg bg-muted/60 border border-border" />
          </div>

          <div className="h-80 rounded-xl bg-card border border-border p-6 space-y-4">
            <div className="h-5 w-44 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="h-64 rounded-xl bg-card border border-border p-6 space-y-4">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-14 rounded-lg bg-muted/50" />
            <div className="h-16 rounded-lg bg-muted/30" />
          </div>

          <div className="h-96 rounded-xl bg-card border border-border p-6 space-y-4">
            <div className="h-5 w-28 bg-muted rounded" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-md bg-muted/50" />
              ))}
            </div>
          </div>

          <div className="h-32 rounded-xl bg-card border border-border p-6 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-8 rounded-lg bg-muted/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
