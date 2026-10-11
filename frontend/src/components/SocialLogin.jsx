import GoogleSignInButton from './GoogleSignInButton';
import FacebookSignInButton from './FacebookSignInButton';

export default function SocialLogin() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-faint">hoặc</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <GoogleSignInButton />
        <FacebookSignInButton />
      </div>
    </div>
  );
}