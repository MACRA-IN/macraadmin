const Toast = ({ message }) => (
  <div className="fixed inset-x-0 bottom-36 z-[95] flex justify-center px-4">
    <p className="max-w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
      {message}
    </p>
  </div>
);

export default Toast;
