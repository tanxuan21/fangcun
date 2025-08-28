import { Router } from 'express'
import { AssetsDatabase, AssetsInterface } from './assets'
import { HTTP_422_check, makeSuccessRep, ReqServerErrorFilter } from '../utils'

const router = Router()
const AssetsDatabaseInstance = new AssetsDatabase(db)

router.get('/:assets_id')

router.post(
  '/assets/add/',
  ReqServerErrorFilter((req: Request, res) => {
    const body = req.body
    if (HTTP_422_check(body, ['name', 'key', 'meta_type', 'meta_data', 'file_type'])) {
      const assets = AssetsDatabaseInstance.insert_assets(
        body['name'],
        body['key'],
        body['meta_type'],
        body['meta_data'],
        body['file_type']
      )
      makeSuccessRep(res)
    }
  })
)
export default router
