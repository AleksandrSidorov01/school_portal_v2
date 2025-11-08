import Card from './Card.jsx';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Подтверждение', 
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default' // default, destructive
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const buttonVariants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md m-4 animate-scale-in">
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          <Card.Description>{message}</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${buttonVariants[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ConfirmModal;

