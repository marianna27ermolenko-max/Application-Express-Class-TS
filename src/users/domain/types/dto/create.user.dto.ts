export type CreateUserDto = {

    login: string;
    password: string;
    email: string;
}


export type CreateUserDtoService = {

    login: string;
    passwordHash: string;
    email: string;
    confirmationCode?: string | null;
    expirationDate?: Date | null;
}