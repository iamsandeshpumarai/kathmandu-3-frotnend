import React from 'react'
import SurveyStatistics from './SurveyResult'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api'

import Loading from '../Loading/Loading'

const SurveyStats = () => {

  const {data:dataSurvey=[]} = useQuery({
    queryKey:['surveyquestion'],
    queryFn:async function(){
   const data =  await api.get('/api/survey/getsurveyquestions')
  return data.data.data 
  }
    
  })

   const {data,isLoading,Error}= useQuery({
        queryKey:['data'],
        queryFn:async function(){
        const data =     await api.get('/api/survey/getsurvey');
      return data.data.userData

        } 
       })

      const dataQuestions =   dataSurvey
      if(isLoading) return <Loading/>
  return (
    <div>
      <SurveyStatistics userData={data} dataSurvey={dataQuestions} />
    </div>
  )
}

export default SurveyStats
