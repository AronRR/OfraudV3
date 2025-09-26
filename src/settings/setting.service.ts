/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { SettingRepository, type Setting } from './setting.repository';

@Injectable()
export class SettingService {
  constructor(private readonly settingRepository: SettingRepository) {}

  findAll(): Promise<Setting[]> {
    return this.settingRepository.findAll();
  }

  findByKey(key: string): Promise<Setting> {
    return this.settingRepository.findByKey(key);
  }

  upsert(key: string, value: string): Promise<Setting> {
    return this.settingRepository.upsertSetting(key, value);
  }
}
