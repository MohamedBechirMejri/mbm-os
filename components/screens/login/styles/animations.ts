export const loginStyles = `
  @keyframes login-shake {
    0% { transform: translateX(0) }
    20% { transform: translateX(-8px) }
    40% { transform: translateX(8px) }
    60% { transform: translateX(-6px) }
    80% { transform: translateX(6px) }
    100% { transform: translateX(0) }
  }
  .shake { animation: login-shake 320ms cubic-bezier(.36,.07,.19,.97) both }
`;
