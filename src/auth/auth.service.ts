import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtPayload } from "./interfaces";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      return {
        ...user,
        token: this.getJwtToken({ id: user.id, email: user.email, branch: user.branch, roles: user.roles })
      }
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async findAll() {
    const users = await this.userRepository.find();

    return users.map(drink => {
      const { ...rest } = drink;
      return {
        ...rest,
      };
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email, branch } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, roles: true, branch: true }
    });

    if (!user) throw new UnauthorizedException('Credenciales no validas');
    if (user.branch !== branch && user.email !== 'luis@gmail.com') {
      throw new UnauthorizedException('No tienes acceso a esta sucursal');
    }
    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credenciales no validas');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email, branch: user.branch, roles: user.roles })
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (updateUserDto.password) {
        updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
      }

      await this.userRepository.update(id, updateUserDto);

      const updatedUser = await this.userRepository.findOneBy({ id });

      return {
        ...updatedUser,
        token: this.getJwtToken({
          id: updatedUser.id,
          email: updatedUser.email,
          branch: updatedUser.branch,
          roles: updatedUser.roles
        })
      };

    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email, branch: user.branch, roles: user.roles })
    }
  }

  private getJwtToken(jwtPayload: JwtPayload) {
    const token = this.jwtService.sign(jwtPayload);
    return token;
  }

  private handleDbErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Porfavor revisa logs del server');
  }
}