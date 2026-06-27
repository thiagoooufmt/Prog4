import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PessoaService } from '../users/pessoa.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly pessoaService: PessoaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    if (createUserDto.username) {
      const existingUser = await this.pessoaService.findByUsername(createUserDto.username);
      if (existingUser) {
        throw new ConflictException('Nome de usuário já cadastrado');
      }
    }

    const user = await this.pessoaService.create(createUserDto);

    const { password, ...result } = user;
    return result;
  }

  async login(username: string, pass: string) {
    const user = await this.pessoaService.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Acesso invalido!');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Acesso invalido!!');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
