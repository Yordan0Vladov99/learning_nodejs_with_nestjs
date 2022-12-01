import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Power } from 'src/powers/power.entity';
import { Filter } from 'src/shared/models/filter';
import { Universe } from 'src/universe/universe.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { HeroDto } from './hero.dto';
import { Hero } from './hero.entity';
import { rm } from 'fs/promises';

@Injectable()
export class HeroService {
  constructor(
    @Inject('HERO_REPOSITORY')
    private heroRepository: Repository<Hero>,
    @Inject('UNIVERSE_REPOSITORY')
    private universeRepo: Repository<Universe>,
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  public async findAllHeroes(filters: Filter[]): Promise<Hero[]> {
    /** Dummy implementation of multiple filter parsing.
     * In order to use in real world project you need to enhance a bit. */
    let typeOrmFilters = {};
    for (const filter of filters) {
      const singleFilter = {};
      if (filter.operator === 'in') {
        singleFilter[`${filter.propertyName}`] = In([null, ...filter.value]);
      } else if (filter.operator === '=') {
        singleFilter[`${filter.propertyName}`] = filter.value;
      } else {
        throw new BadRequestException('Invalid filter provided.');
      }
      typeOrmFilters = { ...typeOrmFilters, ...singleFilter };
    }

    return this.heroRepository.find({
      where: { ...typeOrmFilters },
      relations: ['universe', 'powers'],
    });
  }

  public async findHeroesByName(name: String) {

    const heroes = this.heroRepository.find({
      where: {name: Like(`%${name}%`)
    }});

    return heroes;
  }


  public async findOneHero(id: number) {
    const hero = await this.heroRepository.findOne({
      where: { id: id },
      relations: ['powers', 'universe'],
    });
    
    return hero;
  }

  public async createOne(hero: HeroDto): Promise<Hero> {
    let createdHero = (await (
      await this.heroRepository.insert(hero)
    ).identifiers[0]) as HeroDto;
    createdHero = await this.heroRepository.findOne({
      where: { id: createdHero.id },
      relations: ['powers', 'universe'],
    });
    return createdHero;
  }

  public async updateOne(heroDto: HeroDto): Promise<Hero> {
    const { id, universe } = heroDto;
    let persistedHero = await this.heroRepository.findOne({
      where: { id },
      relations: ['powers', 'universe'],
    });
    if (!persistedHero) {
      throw new NotFoundException(`Hero with id ${id} was not found.`);
    }
    const persistedUniverse = await this.universeRepo.findOne({
      where: { id: universe.id },
    });
    if (!persistedUniverse) {
      throw new NotFoundException(
        `Could not update hero with non-existing universe with id ${id}.`,
      );
    }

    persistedHero = await this.heroRepository.save({ id, ...heroDto });
    return persistedHero;
  }

  public async deleteOne(id: number): Promise<any> {
    let persistedHero = await this.heroRepository.findOne({
      where: { id },
      relations: ['powers', 'universe'],
    });
    if (!persistedHero) {
      throw new NotFoundException(`Hero with id ${id} was not found.`);
    }
    persistedHero = (await this.heroRepository.delete({ id }))?.raw;
    return persistedHero;
  }

  async refreshHeroData() {
    await this.dataSource.manager.transaction(async (manager) => {
      await manager.getRepository(Universe).save([
        { id: 1, name: 'Marvel' },
        { id: 2, name: 'DC' },
      ]);
      await manager.getRepository(Power).save([
        { id: 1, name: 'strength', strength: 5 },
        { id: 2, name: 'laser', strength: 2 },
        { id: 3, name: 'web', strength: 1 },
        { id: 4, name: 'speed', strength: 2 },
        { id: 5, name: 'money', strength: 10 },
      ]);
      await manager.getRepository(Hero).save([
        {
          name: 'Flash',
          powers: [{ id: 4, name: 'speed' }],
          universe: { id: 2, name: 'DC' },
        },
        {
          name: 'Batman',
          powers: [{ id: 5, name: 'money' }],
          universe: { id: 2, name: 'DC' },
        },
        {
          name: 'Spiderman',
          powers: [{ id: 1, name: 'strength' }, , { id: 3, name: 'web' }],
          universe: { id: 1, name: 'Marvel' },
        },
      ]);
    });
  }
}
