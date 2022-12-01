import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MissingDeleteDateColumnError, Repository } from 'typeorm';
import { UniverseDto } from './universe.dto';
import { Universe } from './universe.entity';

@Injectable()
export class UniverseService {
  constructor(
    @Inject('UNIVERSE_REPOSITORY')
    private universeRepository: Repository<Universe>,
  ) {}
  public async findAll(): Promise<Universe[]> {
    return this.universeRepository.find({ relations: ['heroes'] });
  }

  public async createOne(universe: UniverseDto): Promise<Universe> {
    let createdUniverse = await this.universeRepository.save(universe);
    createdUniverse = await this.universeRepository.findOne({
      where: { id: createdUniverse.id },
    });
    return createdUniverse;
  }

  public async updateOne(universeDto: UniverseDto): Promise<Universe> {
    const {id,name}  = universeDto;
    let persistedUniverse = await this.universeRepository.findOne({
      where: {id},
    })
    if (!persistedUniverse) {
      throw new NotFoundException(
        `Could not update non-existent universe with id ${id}`
      );
    }

    persistedUniverse = await this.universeRepository.save({id, ...universeDto});
    return persistedUniverse;

  }

  public async deleteOne (id: number): Promise<any> {
    let persistedUniverse = await this.universeRepository.findOne({
      where: {id}
    });
    
    if (!persistedUniverse) {
      throw new NotFoundException(`Universe with id ${id} was not found.`);
    }

    persistedUniverse = (await this.universeRepository.delete({id}))?.raw;
    return persistedUniverse;
  }
}
