import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import userStore from '../stores/UserStore';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm: React.FC = observer(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userStore.login(email, password);
      
      if (res.message === "Login successful") {
        navigate('/');
      } else {
        alert(res.message);
      }
    } catch (error: any) {
      alert(error.response.data.error);
    }
  };

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
    <h1>Login</h1>
    <form style={{display: "flex", flexDirection: "column", alignItems: "center"}} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      <button type="submit">Login</button>
    </form>
    <div>Don't have an account? <Link to={'/signup'}>Create Account</Link></div>
    </div>
  );
});

export default LoginForm;
