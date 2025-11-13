export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <img 
          src="./assets/progress.gif" 
          alt="Loading..." 
          className="mx-auto w-full h-full"
        />
        <p className="mt-4 text-gray-600">Loading ...</p>
      </div>
    </div>
  )
}