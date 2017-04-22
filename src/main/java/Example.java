import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

import java.util.*;
//import net.sf.json.*;
import java.util.concurrent.*;
import java.lang.*;
import java.util.HashSet;

import com.google.common.collect.Lists;
import com.google.common.util.concurrent.*;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Iterator;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.codehaus.jackson.map.ObjectMapper;
@RestController
@EnableAutoConfiguration
public class Example {

	int lessthanequalto(List<int[]> I, int start, int end, int val){
			if(end < start)return -1;//no such element found
			if(end == start){
				if(I.get(end)[0] + I.get(end)[1] <= val)return end;
				return -1;
			}
			if(end - start == 1){
				if(I.get(end)[0] + I.get(end)[1] <= val)return end;
				if(I.get(start)[0] + I.get(start)[1] <= val)return start;
				return -1;
			}
			int mid = (int)Math.floor(start + (end-start)/2);
			if(I.get(mid)[0] + I.get(mid)[1] > val)
				return lessthanequalto(I, start, mid-1, val);
			if(I.get(mid)[0] + I.get(mid)[1] < val)
				return lessthanequalto(I, mid, end, val);
			return mid;
	}

	int greaterthanequalto (List<int []> I, int start, int end, int val){//return smallest index a using binary search such that I[a][0] >= val
		if(end < start)return -1;//no such element found
		if(end == start){
			if(I.get(end)[0] >= val)return end;
			return -1;
		}
		if(end - start == 1){
			if(I.get(start)[0] >= val)return start;
			if(I.get(end)[0] >= val)return end;
			return -1;
		}
		int mid = (int)Math.floor(start + (end-start)/2);
		if(I.get(mid)[0] < val)
			return greaterthanequalto(I, mid+1, end, val);
		if(I.get(mid)[0] > val)
			return greaterthanequalto(I, start, mid, val);
		return mid;
	}

	int[] binning (int[] ti, int daylength, int binsize){
			//daylength = 86400 seconds, binsize = 3600 seconds (hourly), number of bins = daylength/binsize = 24
			//split ti into hourly bins
			int [] bin = new int [daylength/binsize];
			for(int i = 0; i < daylength/binsize; i++)bin[i]=0;

			int start_days = (int)Math.floor(ti[0]/daylength);
			int start = ti[0] - start_days*daylength; // this ensures that start will be between 0 and daylength/binsize-1
			int days = (int)Math.floor(ti[1]/daylength);
			for(int i = 0; i < daylength/binsize; i++)bin[i]+=days;

			int end = (start+ti[1] - days*daylength);// this ensures that end will be between 0 and 2*daylength/binsize-1
			if(end == start)return bin;
			for(int i = 0; i < 2*daylength/binsize; i++){
				if(i*binsize <= start  && start < (i+1)*binsize) bin[i%(daylength/binsize)]++;
				else if(i*binsize < end && end <= (i+1)*binsize) bin[i%(daylength/binsize)]++;
				else if(start <= i*binsize && (i+1)*binsize <= end) bin[i%(daylength/binsize)]++;
			}
			return bin;
		}

		int[] daily (int[] ti){
			return binning(ti, 86400, 3600);
		}

		int [] weekly(int[] ti){
			return binning(ti, 86400*7, 3600);
		}

		Set<int[]> getOverlapIntervals(List<int[]> I1, List<int[]> I2, int[] j){
			//get smallest index a using binary search such that I[a][0] >= j[0]
			int a = greaterthanequalto(I1, 0, I1.size()-1, j[0]);
			//and get smallest index b such that I[b][0] > j[0]+j[1]
			int b = greaterthanequalto(I1, 0, I1.size()-1, j[0]+j[1]);//since the data is random, we expect the following loop to have very low complexity on average. We also tried to reuse code
			while(b <= I1.size()-1 && b>=0 && I1.get(b)[0] == j[0]+j[1]){
				b++;
			}
			//these are elements in range [a, b-1] which conflict with j


			int A = lessthanequalto(I2, 0, I2.size() -1, j[0]);	//get largest index A using binary search such that I[a][0] + I[a][1] < j[0]
			int B = lessthanequalto(I2, 0, I2.size() -1, j[0] + j[1]);	//and get largest index B such that I[b][0] + I[b][1] <= j[0]+j[1]
			while(A >= 0 && A<=I2.size()-1 && I2.get(A)[0] + I2.get(A)[1] == j[0]){
				A--;
			}

			//these are elements in range [A+1, B] which conflict with j
			//Now add all elements in the set
			Set<int[]> set = new HashSet<int[]>();
			for(int i = a; i <= b-1; i++)
				set.add(I1.get(i));
			for(int i = A+1; i <= B; i++)
				set.add(I2.get(i));

			return set;
		}

		int[] getFrequencyVector (Set<int[]> intervals, int[] j){
			//Now just bin these interval elements to get their hourly frequency
			int [] bin = new int [24];
			for(int i = 0; i < 24; i++)bin[i]=0;
			for (int[] item : intervals){
				int[] temp = daily(item);
				for(int x = 0; x < 24; x++)bin[x]+=temp[x];
			}

			//Now make sure that bin vector is non-zero for the hours only when j interval is in that hour.
			int[] mask = daily(j);
			for(int i = 0; i < bin.length; i++){
				if(mask[i] == 0)
					bin[i] = 0;
			}
			return bin;
		}

		//get frequency vector for part 2 of the question
		int[] getFrequencyVectorWeekly(List<int[]> intervals, int l, int h){
			//Now just bin these interval elements to get their hourly frequency
			int [] bin = new int [24*7];
			for(int i = 0; i < 24*7; i++)bin[i]=0;

			for (int i = l; i <h; i++){
				int[] temp = weekly(intervals.get(i));

				for(int x = 0; x < 24*7; x++)bin[x]+=temp[x];
			}
			return bin;
		}

		//get frequency vector for part 2 of the question
		int[] getFrequencyVectorDaily (List<int[]> intervals){
			//Now just bin these interval elements to get their hourly frequency
			int [] bin = new int [24];
			for(int i = 0; i < 24; i++)bin[i]=0;
			for (int[] item : intervals){
				int[] temp = daily(item);
				for(int i = 0; i < 24; i++)bin[i]+=temp[i];
			}
			return bin;
		}

		List<int[]> readfile(String name, int n) throws FileNotFoundException, IOException, ParseException{
			JSONParser parser = new JSONParser();
			Object obj = parser.parse(new FileReader(name));
			JSONArray array = (JSONArray) obj;
			int c = 0;
			List<int[]> I = new ArrayList<int[]>();

			Iterator<JSONArray> iterator = array.iterator();
			while (iterator.hasNext()) {
				//String x = iterator.next();

				JSONArray x = (JSONArray) (iterator.next());
				int idx = 0; int[] temp = new int[2];
				Iterator<Long> r = x.iterator();
				while (r.hasNext()){
					temp[idx] = ((Long)r.next()).intValue();
					idx++;
				}
				I.add(temp);
				c++;
			}
			return I;
		}

		void print(int[] I){
			for(int i = 0; i < I.length;i++)
				System.out.print((I)[i] +" ");
			System.out.println("");
		}

		List<int[]> getI() throws FileNotFoundException, IOException, ParseException{
			List<int[]> I1 = readfile("src/main/resources/static/I1.json", 10000000/2);
			List<int[]> I2 = readfile("src/main/resources/static/I2.json", 10000000/2);
			I1.addAll(I2);
			return I1;
		}

		List<int[]> getJ() throws FileNotFoundException, IOException, ParseException{
			List<int[]> J = readfile("src/main/resources/static/J.json", 10000);
			return J;
		}

		public class Run1 implements Callable<int[]> {
			int c;
			List<int[]> I1, I2, J;
			Run1(int c, List<int[]>I1, List<int[]>I2, List<int[]>J){
				this.c=c;
				this.I1 = I1;
				this.I2 = I2;
				this.J = J;
			}
			@Override
			public int[] call() throws Exception{
				int [] bin = new int [24];
				for(int i = c*1000; i < c*1000+1000; i++){
					Set<int []> overlap = getOverlapIntervals(I1, I2, J.get(i));
					int[] temp = getFrequencyVector(overlap, J.get(i));

					for(int x = 0; x <24;x++){
						bin[x]+=temp[x];
					}
				}
				return bin;
			}
		}

		int[] run1() throws FileNotFoundException, IOException, ParseException, InterruptedException, ExecutionException{
			List<int[]> I = getI();
			List<int[]> J = getJ();
			List<int[]> I2 = new ArrayList<int[]>(I);

			Collections.sort(I, (o1, o2) -> (new Integer(o1[0])).compareTo(new Integer(o2[0])));
			Collections.sort(I2, (o1, o2) -> (new Integer(o1[0]+o1[1])).compareTo(new Integer(o2[0]+o2[1])));

			ListeningExecutorService pool = MoreExecutors.listeningDecorator(Executors.newFixedThreadPool(4));
			int[] data = new int[24];

			List<ListenableFuture<int[]>> futures = Lists.newArrayList();
			for (int i = 0; i < 10; i++) {
				final ListenableFuture<int[]> future = pool.submit(new Run1(i, I, I2, J));
				futures.add(future);
/*
				future.addListener(new Runnable() {
					@Override
					public void run() {
						try {
							final int[] contents = future.get();
							for(int i = 0; i < 24; i++)
								data[i]+=contents[i];
								System.out.println("Updating");
								print(data);
							//...process web site contents
						} catch (InterruptedException e) {
							//log.error("Interrupted", e);
						} catch (ExecutionException e) {
							//log.error("Exception in task", e.getCause());
						}
					}
				}, MoreExecutors.directExecutor());
				*/
			}
			final ListenableFuture<List<int[]>> resultsFuture
		    	= Futures.allAsList(futures);
			List<int[]> results = resultsFuture.get();
			for(int a=0;a<results.size(); a++){
				for(int i = 0; i < 24; i++)
					data[i]+=results.get(a)[i];
			}
			//System.out.println("Updating");
			//print(data);
			return data;
		}
	int[] run2() throws FileNotFoundException, IOException, ParseException, InterruptedException, ExecutionException{
		List<int[]> I = getI();
		//http://stackoverflow.com/a/17893831
		ListeningExecutorService pool = MoreExecutors.listeningDecorator(Executors.newFixedThreadPool(4));
		List<ListenableFuture<int[]>> futures = Lists.newArrayList();
		for (int i = 0; i < 10; i++) {
			final ListenableFuture<int[]> future = pool.submit(new Run2(i, I));
			futures.add(future);
		}

		final ListenableFuture<List<int[]>> resultsFuture
			= Futures.allAsList(futures);
		List<int[]> results = resultsFuture.get();
		int[] data = new int[24*7];
		for(int a=0;a<results.size(); a++){
			for(int i = 0; i < 24*7; i++)
				data[i]+=results.get(a)[i];
		}
		return data;
	}

	public class Run2 implements Callable<int[]> {
		int c;
		List<int[]> I1;
		Run2(int c, List<int[]>I1){
			this.c=c;
			this.I1 = I1;
		}
		@Override
		public int[] call() throws Exception{
			return getFrequencyVectorWeekly(I1, c*1000000, 1000000+c*1000000);
		}
	}

	@RequestMapping("/app/view1")
	String home() throws FileNotFoundException, IOException, ParseException, InterruptedException, ExecutionException {
		int [] x = run1();
		ObjectMapper objectMapper = new ObjectMapper();
		String c = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(x);
		return c;
	}

	@RequestMapping("/app/view2")
	String home2() throws FileNotFoundException, IOException, ParseException, InterruptedException, ExecutionException{
		int [] x = run2();
		ObjectMapper objectMapper = new ObjectMapper();
		String c = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(x);
		return c;
	}

	public static void main(String[] args) throws Exception {
		SpringApplication.run(Example.class, args);
	}
}
