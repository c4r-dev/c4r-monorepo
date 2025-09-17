// 404 Page Component
// Purpose: Handles undefined routes with user-friendly message
// Design: Simple centered layout with minimal styling
// Note: Consider adding navigation options or search functionality
// to help users recover from errors
function NotFound() {
  return (
    <section className="h-[calc(100vh-7rem)] flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold block">404</h1>
      <p className="text-slate-300 my-5 text-3xl">
        <strong>Page not found :(</strong>
      </p>
    </section>
  );
}

export default NotFound;
