using System;

namespace VtigerWebservice
{
	public interface IJson
	{
		object Read(string input);
		string Write(object obj);
	}
}
