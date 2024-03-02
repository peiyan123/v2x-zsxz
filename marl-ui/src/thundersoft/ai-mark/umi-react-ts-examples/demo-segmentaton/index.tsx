import React from 'react'
import { connect } from 'umi'
import Segmentaton from '../components/segmentaton'

const Example3: React.FC<any> = (props) => {
  return (
    <div>
      <Segmentaton />
    </div>
  )
}

// const mapStatetoprops = (state: any) => ({});

// export default connect(mapStatetoprops)(Example3);

export default Example3
