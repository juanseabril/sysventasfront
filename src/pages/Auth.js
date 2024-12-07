import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/images/locatel.png';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        setError(null);
        setSuccess(null);
        
        if (isLogin) {
            api.post('login/', {
                email: data.email,
                password: data.password,
            })
            .then(response => {
                const { access } = response.data;
                localStorage.setItem('access_token', access);
                setSuccess('Inicio de sesión exitoso.');
                reset();
                navigate('/dashboard');
            })
            .catch(err => {
                setError(err.response ? err.response.data.error : 'Error al iniciar sesión');
            });
        } else {
            api.post('register/', {
                username: data.email,
                email: data.email,
                password: data.password,
            })
            .then(response => {
                setSuccess('Usuario registrado exitosamente.');
                reset();
                setIsLogin(true);
            })
            .catch(err => {
                setError(err.response ? err.response.data.error : 'Error al registrar el usuario');
            });
        }
        reset();
    };

    const handleToggleForm = (formType) => {
        setIsLogin(formType);
        reset();
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center">
                    <img src={logo} alt="Logo" style={{ maxWidth: '60%', height: 'auto' }} />
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            {...register('email', { required: 'El correo es obligatorio' })}
                        />
                        {errors.email && <p className="text-danger">{errors.email.message}</p>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            {...register('password', { required: 'La contraseña es obligatoria' })}
                        />
                        {errors.password && <p className="text-danger">{errors.password.message}</p>}
                    </div>

                    {!isLogin && (
                        <>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Confirme Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-control"
                                    {...register('confirmPassword', { required: true })}
                                />
                                {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword.message}</p>}
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-success w-100">
                        {isLogin ? 'Iniciar sesion' : 'Registro'}
                    </button>
                </form>

                <p className="text-center mt-3">
                    {isLogin ? (
                        <>
                            ¿No tienes un usuario?{' '}
                            <span
                                className="text-primary text-decoration-underline"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleForm(false)}
                            >
                                Registrate
                            </span>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes una cuenta?{' '}
                            <span
                                className="text-primary text-decoration-underline"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleForm(true)}
                            >
                                Ingresa
                            </span>
                        </>
                    )}
                </p>

                {error && <p className="text-danger text-center">{error}</p>}
                {success && <p className="text-success text-center">{success}</p>}
            </div>
        </div>
    );
};

export default Auth;
