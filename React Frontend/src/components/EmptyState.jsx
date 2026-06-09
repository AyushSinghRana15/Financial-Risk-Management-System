function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="text-5xl text-slate-300 dark:text-slate-600 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}

export default EmptyState;
