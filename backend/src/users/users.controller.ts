import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete, Query, HttpException, InternalServerErrorException,Logger
} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {UsersService} from "./users.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import { UserDto } from "./dto/user.dto";

@ApiTags("users")
@Controller({path: "users", version: "1"})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return user;
    } catch (error) {
      // Log full stack if available, fallback to stringified error
      this.logger.error(
        'Exception | Failed to create user',
        error?.stack ?? String(error),
        UsersController.name,
      );

      // Do not leak internal error details to clients
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get()
  findAll() : Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get("search") // it must be ahead of the below Get(":id") to avoid conflict
  async searchUsers(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("sort") sort: string, // JSON string to store sort key and sort value, ex: {name: "ASC"}
    @Query("filter") filter: string // JSON array for key, operation and value, ex: [{key: "name", operation: "like", value: "Peter"}]
  ) {
    if (isNaN(page) || isNaN(limit)) {
      throw new HttpException("Invalid query parameters", 400);
    }
    return this.usersService.searchUsers(page, limit, sort, filter);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new HttpException("User not found.", 404);
    }
    return user;
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }


}
