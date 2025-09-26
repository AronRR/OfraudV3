/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { SettingService } from './setting.service';
import type { Setting } from './setting.repository';

class UpsertSettingDto {
  @ApiProperty({ example: 'max_pending_reports' })
  key: string;

  @ApiProperty({ example: '5' })
  value: string;
}

@ApiTags('Configuraciones')
@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  findAll(): Promise<Setting[]> {
    return this.settingService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string): Promise<Setting> {
    return this.settingService.findByKey(key);
  }

  @Post()
  upsert(@Body() dto: UpsertSettingDto): Promise<Setting> {
    return this.settingService.upsert(dto.key, dto.value);
  }
}
