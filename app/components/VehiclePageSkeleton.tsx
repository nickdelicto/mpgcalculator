import { Card, CardContent, CardHeader } from "../../components/ui/card"

export default function VehiclePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 font-heading animate-pulse">
      {/* Title Skeleton */}
      <div className="h-10 bg-gray-700 rounded-lg w-3/4 mb-6" />

      {/* Quick Summary Skeleton */}
      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <div className="h-8 bg-gray-700 rounded-lg w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-700 rounded-lg" />
        </CardContent>
      </Card>

      {/* Main MPG Data Skeleton */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="h-8 bg-gray-700 rounded-lg w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="h-8 bg-gray-700 rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="h-8 bg-gray-700 rounded-lg w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="h-8 bg-gray-700 rounded-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specs Skeleton */}
      <div className="space-y-12">
        <section>
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mb-6" />
          <div className="h-24 bg-gray-700 rounded-lg" />
        </section>

        {/* Similar Vehicles Skeleton */}
        <section className="border-t border-gray-700 pt-12">
          <div className="h-8 bg-gray-700 rounded-lg w-1/2 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 bg-gray-700 rounded-lg" />
                    <div className="h-8 w-20 bg-gray-700 rounded-lg" />
                  </div>
                  <div className="h-6 bg-gray-700 rounded-lg w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-700 rounded-lg w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}