import React from 'react'
// import { connect } from 'umi';
import Detection from '../components/detection'

const Example3: React.FC<any> = (props) => {
  return (
    <div>
      <Detection />
    </div>
  )
}

const mapStatetoprops = (state: any) => ({})

// export default connect(mapStatetoprops)(Example3);
export default Example3
