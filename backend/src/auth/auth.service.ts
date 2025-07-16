// backend/src/auth/auth.service.ts - CORREGIDO
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs'; // ✅ CORREGIDO: usar bcryptjs

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear password con bcryptjs
    const hashedPassword = await bcryptjs.hash(registerDto.password, 10); // ✅ CORREGIDO

    // Crear usuario
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generar token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Remover password de la respuesta
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar password con bcryptjs
    const isPasswordValid = await bcryptjs.compare(loginDto.password, user.password); // ✅ CORREGIDO
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Remover password de la respuesta
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: 'Login exitoso',
    };
  }

  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }
}