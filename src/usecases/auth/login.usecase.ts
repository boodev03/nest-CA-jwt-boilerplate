import { JwtConfig } from 'src/domain/config/jwt.interface';
import { BcryptService } from 'src/infrastructure/services/bcrypt/bcrypt.service';
import { JwtTokenService } from 'src/infrastructure/services/jwt/jwt.service';
import { IJwtServicePayload } from '../../domain/adapters/jwt.interface';
import { ILogger } from '../../domain/logger/logger.interface';
import { UserRepository } from '../../domain/repositories/userRepository.interface';

export class LoginUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly jwtTokenService: JwtTokenService,
    private readonly jwtConfig: JwtConfig,
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async getCookieWithJwtToken(username: string) {
    this.logger.log(
      'LoginUseCases execute',
      `The user ${username} have been logged.`,
    );
    const payload: IJwtServicePayload = { username: username };
    const secret = this.jwtConfig.getJwtSecret();
    const expiresIn = this.jwtConfig.getJwtExpirationTime() + 's';
    const token = this.jwtTokenService.createToken(payload, secret, expiresIn);
    return { token, maxAge: this.jwtConfig.getJwtExpirationTime() };
  }

  async getCookieWithJwtRefreshToken(username: string) {
    this.logger.log(
      'LoginUseCases execute',
      `The user ${username} have been logged.`,
    );
    const payload: IJwtServicePayload = { username: username };
    const secret = this.jwtConfig.getJwtRefreshSecret();
    const expiresIn = this.jwtConfig.getJwtRefreshExpirationTime() + 's';
    const token = this.jwtTokenService.createToken(payload, secret, expiresIn);
    await this.setCurrentRefreshToken(token, username);
    return {
      token,
      maxAge: this.jwtConfig.getJwtRefreshExpirationTime(),
    };
  }

  async validateUserForLocalStragtegy(username: string, pass: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }
    const match = await this.bcryptService.compare(pass, user.password);
    if (user && match) {
      await this.updateLoginTime(user.username);
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserForJWTStragtegy(username: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }
    return user;
  }

  async updateLoginTime(username: string) {
    await this.userRepository.updateLastLogin(username);
  }

  async setCurrentRefreshToken(refreshToken: string, username: string) {
    const currentHashedRefreshToken =
      await this.bcryptService.hash(refreshToken);
    await this.userRepository.updateRefreshToken(
      username,
      currentHashedRefreshToken,
    );
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, username: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isRefreshTokenMatching = await this.bcryptService.compare(
      refreshToken,
      user.refresh_token,
    );
    if (isRefreshTokenMatching) {
      return user;
    }

    return null;
  }
}
