import { observer } from 'mobx-react-lite'
import { resolve } from 'pathe'

import { Button } from '../../csuite/button/Button'
import { SQLITE_false } from '../../csuite/types/SQLITE_boolean'
import { asAbsolutePath } from '../../utils/fs/pathUtils'

export const AddHostBtnUI = observer(function AddHostBtnUI_(p: {}) {
   return (
      <Button
         description='Add a new Host'
         icon='mdiPlus'
         look='primary'
         onClick={() => {
            cushy.configFile.update(() => {
               cushy.db.host.create({
                  hostname: '192.168.1.19',
                  port: 8188,
                  name: '192.168.1.19',
                  isLocal: SQLITE_false,
                  useHttps: SQLITE_false,
                  absolutePathToComfyUI: asAbsolutePath(resolve('comfy')),
                  isVirtual: SQLITE_false,
                  isReadonly: SQLITE_false,
               })
            })
         }}
      />
   )
})
