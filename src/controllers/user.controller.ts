import {
  Controller,
  Get,
  Request,
  Post,
  Body,
  UseGuards,
  Res,
  Param,
  Patch,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserService } from '../services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AccessTokenDto, UserRoleDto } from '../dto/UserDto.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() request, @Body() body) {
    return await this.userService.login(body);
  }

  @Post('register')
  async register(@Request() request, @Body() body) {
    return await this.userService.register(body);
  }

  @Get('findbytoken')
  public async findbyToken(@Body() payload: string) {
    const user = await this.userService.findByToken(payload);

    if (!user) {
      return null;
    }

    return user;
  }

  @Roles(UserRoleDto.USER, UserRoleDto.ADMINISTRATOR, UserRoleDto.BOSS)
  @UseGuards(RolesGuard)
  @Get('allusers')
  async getAllUsers(@Res() response, @Request() request) {
    return await this.userService.getAllUsers(request.user);
  }

  @Roles(UserRoleDto.BOSS)
  @UseGuards(RolesGuard)
  @Patch('changeboss/:id')
  async changeBoss(
    @Res() response,
    @Request() request,
    @Body() body,
    @Param('id') id,
  ) {
    const { login } = request.user;
    const { newBossLogin } = body;
    return await this.userService.changeBoss(login, id, newBossLogin);
  }
}
