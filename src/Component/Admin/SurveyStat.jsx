import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, Users, Filter, X, BarChart3, PieChartIcon, Table2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

// Mock data hook - replace with your actual useQuery
const useSurveyData = () => {
  // Your actual implementation here


  const mockData = []; // Replace with actual data
  
const {data:realData,isLoading,error} =   useQuery({
    queryKey:['surveyData'],
    queryFn: async()=>{
      const data =  await api.get('/api/survey/getsurvey');
      return data.data.userData
    }
  })

  return {
    data: realData || mockData,
    isLoading: false,
    isError: false,
    error: null
  };
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const SurveyAnalyticsDashboard = () => {
  const { data: surveys, isLoading } = useSurveyData();
 
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [viewMode, setViewMode] = useState('bar');
  const [selectedWard, setSelectedWard] = useState('all');

  // Get unique wards
  const uniqueWards = useMemo(() => {
    if (!surveys) return [];
    const wards = new Set();
    surveys?.forEach(response => {
      if (response.wardNumber) {
        wards.add(response.wardNumber);
      }
    });
    return ['all', ...Array.from(wards).sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    })];
  }, [surveys]);

  // Filter surveys by ward
  const filteredSurveys = useMemo(() => {
    if (!surveys) return [];
    if (selectedWard === 'all') return surveys;
    return surveys.filter(s => s.wardNumber === selectedWard);
  }, [surveys, selectedWard]);

  // Get unique surveys
  const uniqueSurveys = useMemo(() => {
    if (!filteredSurveys) return [];
    const surveyMap = new Map();
    filteredSurveys.forEach(response => {
      response.surveys?.forEach(survey => {
        if (!surveyMap.has(survey.surveyKey)) {
          surveyMap.set(survey.surveyKey, {
            key: survey.surveyKey,
            topic: survey.topic,
            subject: survey.subject
          });
        }
      });
    });
    return Array.from(surveyMap.values());
  }, [filteredSurveys]);

  // Get questions for selected survey
  const questions = useMemo(() => {
    if (!selectedSurvey || !filteredSurveys) return [];
    const questionMap = new Map();

    filteredSurveys.forEach(response => {
      const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
      survey?.answers?.forEach(ans => {
        if (!questionMap.has(ans.questionId)) {
          const isMultiPart = typeof ans.answer === 'object' &&
            ans.answer !== null &&
            !Array.isArray(ans.answer) &&
            Object.keys(ans.answer).length > 0;

          questionMap.set(ans.questionId, {
            id: ans.questionId,
            text: ans.questionText,
            isMultiPart: isMultiPart,
            subQuestions: isMultiPart ? Object.keys(ans.answer).filter(k => k !== '') : []
          });
        } else {
          const existing = questionMap.get(ans.questionId);
          if (existing.isMultiPart && typeof ans.answer === 'object' && ans.answer !== null) {
            const newSubQuestions = Object.keys(ans.answer).filter(k => k !== '');
            const mergedSubQuestions = [...new Set([...existing.subQuestions, ...newSubQuestions])];
            questionMap.set(ans.questionId, {
              ...existing,
              subQuestions: mergedSubQuestions
            });
          }
        }
      });
    });

    return Array.from(questionMap.values());
  }, [selectedSurvey, filteredSurveys]);

  // Analyze answers with top 5 + others grouping
  const answerAnalysis = useMemo(() => {
    if (!selectedQuestion || !selectedSurvey || !filteredSurveys) return null;

    if (selectedQuestion.isMultiPart) {
      const subQuestionAnalysis = {};

      selectedQuestion.subQuestions.forEach(subQ => {
        const answerCounts = new Map();
        const respondentsByAnswer = new Map();

        filteredSurveys.forEach(response => {
          const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
          const answer = survey?.answers?.find(a => a.questionId === selectedQuestion.id);

          if (answer && typeof answer.answer === 'object') {
            const subAnswer = String(answer.answer[subQ] || '').trim();

            if (subAnswer) {
              answerCounts.set(subAnswer, (answerCounts.get(subAnswer) || 0) + 1);

              if (!respondentsByAnswer.has(subAnswer)) {
                respondentsByAnswer.set(subAnswer, []);
              }
              respondentsByAnswer.get(subAnswer).push({
                id: response._id,
                name: response.name,
                age: response.age,
                gender: response.gender,
                wardNumber: response.wardNumber,
                address: response.address,
                phoneNumber: response.phoneNumber,
                caste: response.caste,
                educationLevel: response.educationLevel
              });
            }
          }
        });

        const sortedAnswers = Array.from(answerCounts.entries())
          .sort((a, b) => b[1] - a[1]);

        const topAnswers = sortedAnswers.slice(0, 5);
        const otherAnswers = sortedAnswers.slice(5);

        let chartData = topAnswers.map(([answer, count]) => ({
          answer: answer.length > 40 ? answer.substring(0, 40) + '...' : answer,
          fullAnswer: answer,
          count,
          percentage: ((count / filteredSurveys.length) * 100).toFixed(1),
          isOther: false
        }));

        if (otherAnswers.length > 0) {
          const otherCount = otherAnswers.reduce((sum, [, count]) => sum + count, 0);
          
          chartData.push({
            answer: `अन्य विचार (${otherAnswers.length})`,
            fullAnswer: 'Other opinions',
            count: otherCount,
            percentage: ((otherCount / filteredSurveys.length) * 100).toFixed(1),
            isOther: true,
            otherAnswers: otherAnswers.map(([ans, cnt]) => ({
              answer: ans,
              count: cnt,
              respondents: respondentsByAnswer.get(ans)
            }))
          });
        }

        subQuestionAnalysis[subQ] = { chartData, respondentsByAnswer };
      });

      return { isMultiPart: true, subQuestionAnalysis };
    }

    // Single-choice questions
    const answerCounts = new Map();
    const respondentsByAnswer = new Map();

    filteredSurveys.forEach(response => {
      const survey = response.surveys?.find(s => s.surveyKey === selectedSurvey.key);
      const answer = survey?.answers?.find(a => a.questionId === selectedQuestion.id);

      if (answer) {
        const answerText = String(answer.answer).trim();

        if (answerText) {
          answerCounts.set(answerText, (answerCounts.get(answerText) || 0) + 1);

          if (!respondentsByAnswer.has(answerText)) {
            respondentsByAnswer.set(answerText, []);
          }
          respondentsByAnswer.get(answerText).push({
            id: response._id,
            name: response.name,
            age: response.age,
            gender: response.gender,
            wardNumber: response.wardNumber,
            address: response.address,
            phoneNumber: response.phoneNumber,
            caste: response.caste,
            educationLevel: response.educationLevel
          });
        }
      }
    });

    const chartData = Array.from(answerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([answer, count]) => ({
        answer: answer.length > 40 ? answer.substring(0, 40) + '...' : answer,
        fullAnswer: answer,
        count,
        percentage: ((count / filteredSurveys.length) * 100).toFixed(1),
        isOther: false
      }));

    return { isMultiPart: false, chartData, respondentsByAnswer };
  }, [selectedQuestion, selectedSurvey, filteredSurveys]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading survey data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                सर्वेक्षण विश्लेषण
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total Respondents: <span className="font-semibold text-blue-600">{filteredSurveys.length}</span>
              </p>
            </div>
            
            {/* Ward Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedWard}
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  setSelectedSurvey(null);
                  setSelectedQuestion(null);
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="all">All Wards</option>
                {uniqueWards.filter(w => w !== 'all').map(ward => (
                  <option key={ward} value={ward}>Ward {ward}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Survey and Question Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Survey Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Select Survey
              </label>
              <select
                value={selectedSurvey?.key || ''}
                onChange={(e) => {
                  const survey = uniqueSurveys.find(s => s.key === e.target.value);
                  setSelectedSurvey(survey);
                  setSelectedQuestion(null);
                  setSelectedAnswer(null);
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              >
                <option value="">-- Choose a Survey --</option>
                {uniqueSurveys.map(survey => (
                  <option key={survey.key} value={survey.key}>
                    {survey.topic}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                Select Question
              </label>
              <select
                value={selectedQuestion?.id || ''}
                onChange={(e) => {
                  const question = questions.find(q => q.id === e.target.value);
                  setSelectedQuestion(question);
                  setSelectedAnswer(null);
                }}
                disabled={!selectedSurvey}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              >
                <option value="">-- Choose a Question --</option>
                {questions.map(question => (
                  <option key={question.id} value={question.id}>
                    {question.text}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Answer Analysis */}
        {selectedQuestion && answerAnalysis && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis Results</h2>
              <p className="text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-l-4 border-blue-500">
                {selectedQuestion.text}
              </p>
              {selectedWard !== 'all' && (
                <p className="mt-2 text-sm text-gray-600">
                  Filtered by: <span className="font-semibold text-blue-600">Ward {selectedWard}</span>
                </p>
              )}
            </div>

            {/* Multi-part Question Analysis */}
            {answerAnalysis.isMultiPart ? (
              <div className="space-y-8">
                {Object.entries(answerAnalysis.subQuestionAnalysis).map(([subQuestion, analysis], idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-200">{subQuestion}</h3>

                    {/* View Mode Toggle */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button
                        onClick={() => setViewMode('bar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          viewMode === 'bar' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        Bar Chart
                      </button>
                      <button
                        onClick={() => setViewMode('pie')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          viewMode === 'pie' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <PieChartIcon className="w-4 h-4" />
                        Pie Chart
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          viewMode === 'table' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Table2 className="w-4 h-4" />
                        Table
                      </button>
                    </div>

                    {/* Visualization */}
                    {viewMode === 'bar' && (
                      <ResponsiveContainer width="100%" height={Math.max(350, analysis.chartData.length * 70)}>
                        <BarChart data={analysis.chartData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="answer" 
                            angle={-45} 
                            textAnchor="end" 
                            height={120}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ value: 'Responses', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                            formatter={(value) => [`${value} responses (${((value/filteredSurveys.length)*100).toFixed(1)}%)`, 'Count']}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#3B82F6" 
                            radius={[8, 8, 0, 0]}
                            onClick={(data) => {
                              if (data.isOther) {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer,
                                  isOther: true,
                                  otherAnswers: data.otherAnswers
                                });
                              } else {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer
                                });
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {viewMode === 'pie' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={analysis.chartData}
                            dataKey="count"
                            nameKey="answer"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={(entry) => `${entry.percentage}%`}
                            onClick={(data) => {
                              if (data.isOther) {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer,
                                  isOther: true,
                                  otherAnswers: data.otherAnswers
                                });
                              } else {
                                setSelectedAnswer({
                                  answer: data.fullAnswer,
                                  subQuestion,
                                  respondents: analysis.respondentsByAnswer
                                });
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {analysis.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    {viewMode === 'table' && (
                      <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                              <th className="p-4 text-left font-semibold">Answer</th>
                              <th className="p-4 text-center font-semibold">Count</th>
                              <th className="p-4 text-center font-semibold">Percentage</th>
                              <th className="p-4 text-center font-semibold">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.chartData.map((item, index) => (
                              <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                <td className="p-4">{item.fullAnswer}</td>
                                <td className="p-4 text-center font-bold text-blue-600">{item.count}</td>
                                <td className="p-4 text-center">
                                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {item.percentage}%
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => {
                                      if (item.isOther) {
                                        setSelectedAnswer({
                                          answer: item.fullAnswer,
                                          subQuestion,
                                          respondents: analysis.respondentsByAnswer,
                                          isOther: true,
                                          otherAnswers: item.otherAnswers
                                        });
                                      } else {
                                        setSelectedAnswer({
                                          answer: item.fullAnswer,
                                          subQuestion,
                                          respondents: analysis.respondentsByAnswer
                                        });
                                      }
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Single-choice Question Analysis */
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setViewMode('bar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'bar' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setViewMode('pie')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'pie' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <PieChartIcon className="w-4 h-4" />
                    Pie Chart
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Table2 className="w-4 h-4" />
                    Table
                  </button>
                </div>

                {viewMode === 'bar' && (
                  <ResponsiveContainer width="100%" height={Math.max(400, answerAnalysis.chartData.length * 70)}>
                    <BarChart data={answerAnalysis.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="answer" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Responses', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
                        formatter={(value) => [`${value} responses (${((value/filteredSurveys.length)*100).toFixed(1)}%)`, 'Count']}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        fill="#3B82F6" 
                        radius={[8, 8, 0, 0]}
                        onClick={(data) => setSelectedAnswer({ answer: data.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {viewMode === 'pie' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={answerAnalysis.chartData}
                        dataKey="count"
                        nameKey="answer"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => `${entry.percentage}%`}
                        onClick={(data) => setSelectedAnswer({ answer: data.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })}
                        style={{ cursor: 'pointer' }}
                      >
                        {answerAnalysis.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {viewMode === 'table' && (
                  <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <th className="p-4 text-left font-semibold">Answer</th>
                          <th className="p-4 text-center font-semibold">Count</th>
                          <th className="p-4 text-center font-semibold">Percentage</th>
                          <th className="p-4 text-center font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {answerAnalysis.chartData.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                            <td className="p-4">{item.fullAnswer}</td>
                            <td className="p-4 text-center font-bold text-blue-600">{item.count}</td>
                            <td className="p-4 text-center">
                              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                {item.percentage}%
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setSelectedAnswer({ answer: item.fullAnswer, respondents: answerAnalysis.respondentsByAnswer })}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Respondent Details Modal */}
            {selectedAnswer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedAnswer.isOther ? 'All Other Opinions' : 'Respondent Details'}
                      </h3>
                      {selectedAnswer.subQuestion && (
                        <p className="text-blue-100 mt-1">Sub-question: {selectedAnswer.subQuestion}</p>
                      )}
                      {!selectedAnswer.isOther && (
                        <p className="text-blue-100 mt-1">Answer: <span className="font-semibold">{selectedAnswer.answer}</span></p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedAnswer(null)}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                    {selectedAnswer.isOther ? (
                      /* Show all other opinions grouped */
                      <div className="space-y-6">
                        {selectedAnswer.otherAnswers.map((other, idx) => (
                          <div key={idx} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 pb-4 border-b-2 border-gray-200">
                              <h4 className="font-bold text-gray-800 text-lg">"{other.answer}"</h4>
                              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold inline-block w-fit">
                                {other.count} {other.count === 1 ? 'person' : 'people'}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Name</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Age</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Gender</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Ward</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Phone</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Caste</th>
                                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Education</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {other.respondents?.map((respondent, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-blue-50 transition-colors">
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.name}</td>
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.age}</td>
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.gender}</td>
                                      <td className="border border-gray-300 p-3 text-sm">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                          {respondent.wardNumber || 'N/A'}
                                        </span>
                                      </td>
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.phoneNumber}</td>
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.caste}</td>
                                      <td className="border border-gray-300 p-3 text-sm">{respondent.educationLevel}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Show single answer respondents */
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                              <th className="border border-gray-300 p-3 text-left font-semibold">Name</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Age</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Gender</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Ward</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Phone</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Caste</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Education</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedAnswer.respondents.get(selectedAnswer.answer)?.map((respondent, idx) => (
                              <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                <td className="border border-gray-300 p-3">{respondent.name}</td>
                                <td className="border border-gray-300 p-3">{respondent.age}</td>
                                <td className="border border-gray-300 p-3">{respondent.gender}</td>
                                <td className="border border-gray-300 p-3">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                    {respondent.wardNumber || 'N/A'}
                                  </span>
                                </td>
                                <td className="border border-gray-300 p-3">{respondent.phoneNumber}</td>
                                <td className="border border-gray-300 p-3">{respondent.caste}</td>
                                <td className="border border-gray-300 p-3">{respondent.educationLevel}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyAnalyticsDashboard;