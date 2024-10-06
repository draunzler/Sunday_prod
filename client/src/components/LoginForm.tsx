import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import userStore from '../stores/UserStore';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../styles/authForm.module.scss"

const LoginForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userStore.login(email, password);
      
      if (res.message === "Login successful") {
        navigate('/');
      } else {
        alert(res.message);
      }
    } catch (error: any) {
      alert(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <img className={`${styles.img} ${loading ? styles.rotate : ''}`} src="/sunday_dark.svg" alt="" />
        <h1>Login to Sunday</h1>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.authPassword} style={{  }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <img src="/show.svg" alt="" /> : 
                <img src="/hide.svg" alt="" />
              }
            </button>
          </div>
          <button type="submit">Login</button>
        </form>
        <div>Don't have an account? <Link to={'/signup'}>Create Account</Link></div>
      </div>
    </div>
  );
});

export default LoginForm;
