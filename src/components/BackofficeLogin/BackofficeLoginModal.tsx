import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';

import { useBackofficeAuth } from './useBackofficeAuth';

export function BackofficeLoginModal({ children }: { children: React.ReactNode }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { user, isLoggingIn, login, logout } = useBackofficeAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      alert('백오피스 ID와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(username, password);
      setUserName('');
      setPassword('');
      setIsOpen(false);
    } catch {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      {user ? (
        <Button
          variant="outline"
          className="bg-white text-cyan-600 hover:bg-gray-100 border-white"
          onClick={handleLogout}
        >
          {user.name} (로그아웃)
        </Button>
      ) : (
        <DialogTrigger asChild>{children}</DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">백오피스 로그인</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="backoffice-id">백오피스 ID</Label>

            <Input
              id="backoffice-id"
              type="text"
              placeholder="백오피스 ID를 입력하세요"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoggingIn}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>

            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1" disabled={isLoggingIn}>
                취소
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
