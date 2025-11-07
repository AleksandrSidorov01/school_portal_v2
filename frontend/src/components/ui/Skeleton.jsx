const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-muted animate-pulse',
    text: 'bg-muted animate-pulse rounded',
    circle: 'bg-muted animate-pulse rounded-full',
    rectangular: 'bg-muted animate-pulse rounded-md',
  };

  return (
    <div className={`${variants[variant]} ${className}`} />
  );
};

export default Skeleton;

