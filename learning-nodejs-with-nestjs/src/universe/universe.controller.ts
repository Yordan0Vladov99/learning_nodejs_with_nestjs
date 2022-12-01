import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UniverseDto } from './universe.dto';
import { UniverseService } from './universe.service';

@Controller('universe')
export class UniverseController {
  constructor(private universeService: UniverseService) {}

  @Get()
  async getAllUniverses() {
    const universes = await this.universeService.findAll();
    return universes;
  }

  @Post()
  async createOne(@Body() universe: UniverseDto) {
    const createdUniverse = await this.universeService.createOne(universe);
    return createdUniverse;
  }

  @Put(':id')
  async updateOneUniverse(@Body() universe: UniverseDto){
    const heroes = await this.universeService.updateOne(universe);
    return heroes;
  }

  @Delete(':id')
  async deleteOneUniverse(@Param('id') id: number) {
    const hero = await this.universeService.deleteOne(id);
    return hero;
  }
}
