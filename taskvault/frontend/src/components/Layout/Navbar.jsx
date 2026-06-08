import { Link } from 'react-router-dom';
import Button from '../UI/Button';

export default function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
      <Link to="/" className="font-display text-2xl font-extrabold">TaskVault</Link>
      <div className="flex items-center gap-3">
        <Link to="/login" className="font-bold text-textMuted hover:text-textPrimary">Sign In</Link>
        <Link to="/register"><Button>Get Started</Button></Link>
      </div>
    </nav>
  );
}
