import React from 'react'
import { connect } from 'umi'
import Landmark from '../components/landmark'

const Example2: React.FC<any> = (props) => {
  return (
    <div>
      <Landmark />
    </div>
  )
}

// const mapStatetoprops = (state: any) => ({});

// export default connect(mapStatetoprops)(Example2);

export default Example2
