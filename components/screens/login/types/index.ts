export interface LoginScreenProps {
  onSuccess?: () => void;
}

export interface PasswordInputProps {
  value: string;
  displayValue: string;
  onValueChange: (value: string, displayValue: string) => void;
  onSubmit: () => void;
  verifying: boolean;
  wrong: boolean;
  caps: boolean;
  showHint: boolean;
  onToggleHint: () => void;
}

export interface TimeDisplayProps {
  date: string;
  time: string;
}
 