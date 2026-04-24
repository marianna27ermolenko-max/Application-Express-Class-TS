
export interface UserAccountDbType {

  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  },

  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  },
  recoveryCode?: { 
    confirmationCode: string | null;
    expirationDate: Date | null;
  }
}
