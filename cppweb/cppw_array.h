#ifndef CPPW_ARRAY_H
#define CPPW_ARRAY_H

#include <vector>

using namespace std;

template <class T>
class CWArray
{
	public:
		vector<T> Items;
		bool OwnsItems;

		CWArray();
		~CWArray();

		int Count();

		void Clear();
		void Delete(int iIndex);

		void Add(T pItem);
		void Append(CWArray<T>* pArray);
		void CopyFrom(CWArray<T>* pArray);
		int IndexOf(T pItem);
};

template <class T>
CWArray<T>::CWArray()
{
	OwnsItems = true;

}

template <class T>
CWArray<T>::~CWArray()
{
	Clear();
}

template <class T>
int CWArray<T>::Count()
{
	return (int)Items.size();
}

template <class T>
void CWArray<T>::Clear()
{
	if(OwnsItems)
	{
		int count = Count();
		for(int i = count - 1; i >= 0; i--)
			delete Items[i];
	}
	Items.clear();
}

template <class T>
void CWArray<T>::Delete(int iIndex)
{
	if(OwnsItems)
		delete Items[iIndex];

	Items.erase(iIndex);
}

template <class T>
void CWArray<T>::Add(T pItem)
{
	Items.push_back(pItem);
}

template <class T>
void CWArray<T>::Append(CWArray<T>* pArray)
{
	int count = pArray->Count();
	for(int i = 0; i < count; i++)
		Add(pArray->Items[i]);
}

template <class T>
void CWArray<T>::CopyFrom(CWArray<T>* pArray)
{
	Clear();
	Append(pArray);
}

template <class T>
int CWArray<T>::IndexOf(T pItem)
{
	int count = Count();
	for(int i = 0; i < count; i++)
		if(Items[i] == pItem)
			return i;
	return -1;
}


#endif // CPPW_ARRAY_H
