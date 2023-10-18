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
  HttpStatus,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserService } from '../services/user.service';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AccessTokenDto, UserRoleDto } from '../dto/UserDto.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: "Login to account" })
  @ApiQuery({ name: "login", required: true})
  @ApiQuery({ name: "password", required: true })
  @ApiResponse({ status: HttpStatus.OK, description: "Success"})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  async login(@Request() request, @Body() body) {
    return await this.userService.login(body);
  }

  @ApiOperation({ summary: "Register account" })
  @ApiQuery({ name: "login", required: true})
  @ApiQuery({ name: "password", required: true })
  @ApiQuery({ name: "role" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success"})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
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

  @ApiOperation({ summary: "Get users by role" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success"})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @Roles(UserRoleDto.USER, UserRoleDto.ADMINISTRATOR, UserRoleDto.BOSS)
  @UseGuards(RolesGuard)
  @Get('allusers')
  @ApiBearerAuth('JWT-auth')
  async getAllUsers(@Res() response, @Request() request) {
    return await this.userService.getAllUsers(request.user);
  }

  @ApiOperation({ summary: "change boss in user" })
  @ApiParam({ name: "id", required: true, description: "user id which needed for new boss" })
  @ApiQuery({ name: "newBossLogin", required: true, description: "login of new boss"})
  @ApiResponse({ status: HttpStatus.OK, description: "Success"})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiBearerAuth('JWT-auth')
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
