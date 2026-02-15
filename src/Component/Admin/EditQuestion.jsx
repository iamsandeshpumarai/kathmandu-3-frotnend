import React from 'react'
import { useParams } from 'react-router-dom'

const EditQuestion = () => {
    const {id} = useParams()
    console.log(id ,'is the docuent id')
  return (
    <div>
      
    </div>
  )
}

export default EditQuestion
