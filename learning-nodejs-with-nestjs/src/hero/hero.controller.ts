import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Filter } from 'src/shared/models/filter';
import { HeroDto } from './hero.dto';
import { HeroService } from './hero.service';

@Controller('hero')
export class HeroController {
  constructor(private heroService: HeroService) {}

  @Get()
  async getAllHeroes(@Query('filters') filters = '[]') {
    /**
     * You can use by passing the following example :
     * http://localhost:3000/hero?filters=[{"propertyName":"universe","value":1,"operator":"="}]
     */
    let parsedFilters;
    try {
      parsedFilters = JSON.parse(filters);
    } catch (e) {
      throw new BadRequestException('Invalid filters object provided.');
    }
    const heroes = await this.heroService.findAllHeroes(parsedFilters);
    return heroes;
  }

  @Get(':id')
  async getOneHero(@Param('id') id) {
    const hero = await this.heroService.findOneHero(id);
    return hero;
  }

  @Get('/getName/:name')
  async getHeroesByName(@Param('name') name) {
    const heroes = await this.heroService.findHeroesByName(name);
    return heroes;
  }

  @Post()
  async createOneHero(@Body() hero: HeroDto) {
    const heroes = await this.heroService.createOne(hero);
    return heroes;
  }

  @Put(':id')
  async updateOneHero(@Body() hero: HeroDto) {
    const heroes = await this.heroService.updateOne(hero);
    return heroes;
  }

  @Delete(':id')
  async deleteOneHero(@Param('id') id: number) {
    const hero = await this.heroService.deleteOne(id);
    return hero;
  }

  @Post('refresh-data')
  async refreshHeroData() {
    const heroes = await this.heroService.refreshHeroData();
    return heroes;
  }
}
