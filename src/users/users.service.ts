import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findOne(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOneAndReplace(
      { _id: id },
      updateUserDto,
      { new: true },
    );
    if (!updateUserDto) {
      throw new NotFoundException();
    }
    return user;
  }

  async remove(id: string): Promise<any> {
    return await this.userModel.findByIdAndRemove(id);
  }
}
