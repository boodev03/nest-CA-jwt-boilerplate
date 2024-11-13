import { DynamicModule, Module } from '@nestjs/common';
import { UseCaseProxy } from './usecase-proxy';
import { LoginUseCases } from 'src/usecases/auth/login.usecase';
import { LoggerService } from '../logger/logger.service';
import { JwtTokenService } from '../services/jwt/jwt.service';
import { JwtConfig } from 'src/domain/config/jwt.interface';

@Module({})
export class UsecaseProxyModule {
  static LOGIN_USECASE_PROXY = 'LoginUseCaseProxy';
  static LOGOUT_USECASE_PROXY = 'LogoutUseCaseProxy';
  static IsAuthenticated_USECASE_PROXY = 'IsAuthenticatedUseCaseProxy';

  static register(): DynamicModule {
    return {
      module: UsecaseProxyModule,
      providers: [
        {
          inject: [],
          provide: UsecaseProxyModule.LOGIN_USECASE_PROXY,
          useFactory: (
            logger: LoggerService,
            jwtTokenService: JwtTokenService,
            config: JwtConfig,
            userRepo: DatabaseUserRepository,
            bcryptService: BcryptService,
          ) => new UseCaseProxy(new LoginUseCases()),
        },
      ],
    };
  }
}
