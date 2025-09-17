function NotFound() {
  return (
    <section className="h-[calc(100vh-7rem)] flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold block">404</h1>
      <p className="text-slate-300 my-5 text-2xl">
        <strong>Page not found :(</strong>
      </p>
    </section>
  );
}

export default NotFound;
