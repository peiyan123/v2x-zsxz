import React from 'react'
import { connect } from 'umi'
import KeyPoint from '../components/key-point'

const Example2: React.FC<any> = (props) => {
  return (
    <div>
      <KeyPoint />
    </div>
  )
}

// const mapStatetoprops = (state: any) => ({});

// export default connect(mapStatetoprops)(Example2);

export default Example2
