import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import FormField from '../components/ui/FormField.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        {/* Заголовок */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Регистрация</h1>
          <p className="text-muted-foreground">Создайте аккаунт в школьном портале</p>
        </div>

        {/* Форма регистрации */}
        <Card className="border-border/50 shadow-xl">
          <Card.Content className="pt-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Имя" required>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Иван"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </FormField>

                <FormField label="Фамилия" required>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Иванов"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <FormField label="Email адрес" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="example@school.ru"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Пароль" required>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Минимум 6 символов
                </p>
              </FormField>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Регистрация...
                  </div>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>
          </Card.Content>
        </Card>

        {/* Ссылка на вход */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

