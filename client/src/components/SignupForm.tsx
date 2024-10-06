import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import userStore from '../stores/UserStore';
import { Link, useNavigate } from 'react-router-dom';
import styles from "../styles/authForm.module.scss"

const SignupForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userStore.signup(name, email, password);
      if (res.message === "User created successfully") {
        navigate('/login');
      } else {
        alert(res.message);
      }
    } catch (error: any) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <img className={styles.img} src="/sunday_dark.svg" alt="" />
        <h1>Welcome Aboard!</h1>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.authPassword}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: '5px' }}
            >
              {showPassword ? 
                <img src="/hide.svg" alt="" /> : 
                <img src="/show.svg" alt="" />
              }
            </button>
          </div>
          <button type="submit">Create Account</button>
        </form>
        <div>Already have an account? <Link to={'/login'}>Login</Link></div>
      </div>
    </div>
  );
});

export default SignupForm;
