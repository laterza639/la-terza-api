import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('users')
  findAll() {
    return this.authService.findAll();
  }

  @Post('login')
  loginUser(
    @Body()
    loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser()
    user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

}