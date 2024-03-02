import React from 'react'
import { connect } from 'umi'
import ImageClassification from '../components/classificaton'

const Example1: React.FC<any> = (props) => {
  return (
    <div>
      <ImageClassification />
    </div>
  )
}

// const mapStatetoprops = (state: any) => ({});

// export default connect(mapStatetoprops)(Example1);

export default Example1
