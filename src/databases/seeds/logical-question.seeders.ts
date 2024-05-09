import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { LogicalQuestionsEntity } from '@entities/index';
import { LogicalResultEnum } from '@common/enum/logical-result.enum';
import * as faker from 'faker';

export default class CreateLogicalQuestions implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const current = new Date();
    const firstThisWeek = current.getDate() - current.getDay() + 1;

    // Câu lệnh và kết luận mẫu
    const statements: string[] = [
      'Statement A',
      'Statement B',
      'Statement C',
      'Statement D',
      'Statement E',
      'Statement F',
      'Statement G',
      'Statement H',
      'Statement I',
      'Statement J',
      'Statement K',
      'Statement L',
      'Statement M',
      'Statement N',
    ];

    const logical_questions = [];

    // 50 sample logical question records with result 'No'
    for (let i = 0; i < 53; i++) {
      const title = `Question ${i + 1}`;
      const firstStatement = faker.random.arrayElement(statements);
      const secondStatement = faker.random.arrayElement(statements);
      const conclusion = `${firstStatement} is true.`;
      const result = LogicalResultEnum.Yes;

      const sample_yes_logical_question = {
        title: title,
        first_statement: firstStatement,
        second_statement: secondStatement,
        conclusion: conclusion,
        result: result,
        score: 1,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      };

      logical_questions.push(sample_yes_logical_question);
    }

    // 50 sample logical question records with result 'No'
    for (let i = 0; i < 54; i++) {
      const title = `Question ${i + 54}`; // from 54 to 107
      const firstStatement = faker.random.arrayElement(statements);
      const secondStatement = faker.random.arrayElement(statements);
      const conclusion = `${firstStatement} is false.`;
      const result = LogicalResultEnum.No;

      const sample_no_logical_question = {
        title: title,
        first_statement: firstStatement,
        second_statement: secondStatement,
        conclusion: conclusion,
        result: result,
        score: 1,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      };

      logical_questions.push(sample_no_logical_question);
    }

    await connection
      .createQueryBuilder()
      .insert()
      .into(LogicalQuestionsEntity)
      .values(logical_questions)
      .execute();
  }
}
