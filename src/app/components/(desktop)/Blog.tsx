export default function DesktopBlogPage() {
  return (
    <div className="px-[7rem]">
      <div className="w-full h-full bg-[#2f2e2e] flex flex-col gap-[2rem]  pt-6">
        <span className="px-4">All Posts</span>

        <div className="border border-gray-600 min-h-[30rem] flex items-center justify-center">
          <div className="flex gap-3 flex-col items-center">
            <span className="text-4xl">Check back soon</span>
            <span className="text-xl">
              Once posts are published, you'll see them here.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
