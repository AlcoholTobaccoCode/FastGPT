// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { driver } from '@fastgpt/service/common/neo4j/index';
import { toNumber } from 'neo4j-driver-core/lib/integer.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (a)-[r]->(b) 
      RETURN a, r, b`);
    console.log(result);
    jsonRes(res, {
      data: {
        data: result.records.map((item: any) => {
          const a = item.get('a');
          const r = item.get('r');
          const b = item.get('b');
          return {
            source:
              r?.type === 'BELONGS_TO'
                ? `${a.labels[0]}-${a.properties?.id}`
                : `${a.labels[0]}-${toNumber(a.identity)}`,
            target: `${b.labels[0]}-${b.properties?.id}`
          };
        })
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  } finally {
    session.close();
  }
}
